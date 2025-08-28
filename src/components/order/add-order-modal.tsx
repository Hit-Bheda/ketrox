import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner"


type Ordertype = {
    id: string;
    tableId: string;
    tableNumber: string;
    tenantId: string;
    managerId: string;
    customerName: string;
    items: string[];
    quantity: string[];
    status: "pending" | "completed" | "cancelled" | string;
    totalPrice: string;
    createdAt: string;
    updatedAt: string;
    managerName: string;
    orderNumber: string;
    itemNames: string[];
};

export default function BookOrderModal({
    open,
    setOpen,
    tableId,
    tenantId,
    managerId,
    onOrderAdded,
    order,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
    tableId: string;
    tenantId: string;
    managerId: string;
    onOrderAdded: () => void;
    order?: Ordertype;
}) {
    const [menuItems, setMenuItems] = useState<{ id: string; item_name: string; price: number }[]>([]);
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [quantities, setQuantities] = useState<{ [itemId: string]: number }>({});
    const [customerName, setCustomerName] = useState("");
    const [status, setStatus] = useState("pending");
    const [loading, setLoading] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Ordertype | undefined>(undefined);

    // Fetch menu items
    useEffect(() => {
        if (open) {
            fetch("/api/admin/menu")
                .then(res => res.json())
                .then(data => {
                    console.log("Menu API response:", data);
                    setMenuItems(data.menu || []);
                });
        }
    }, [open]);

    // Calculate total price
    const totalPrice = selectedItems.reduce((sum, itemId) => {
        const item = menuItems.find(i => i.id === itemId);
        const qty = quantities[itemId] || 0;
        return sum + (item ? item.price * qty : 0);
    }, 0);

    // Handle item selection
    const handleSelectItem = (itemId: string) => {
        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                setQuantities(q => ({ ...q, [itemId]: (q[itemId] || 1) + 1 }));
                return prev;
            } else {
                setQuantities(q => ({ ...q, [itemId]: q[itemId] || 1 }));
                return [...prev, itemId];
            }
        });
    };

    // Handle quantity change
    const handleQuantityChange = (itemId: string, qty: number) => {
        setQuantities(prev => ({ ...prev, [itemId]: qty }));
    };


    const resetForm = () => {
        setCustomerName("");
        setSelectedItems([]);
        setQuantities({});
        setStatus("pending");
    };
    // Submit order
    const handleSubmit = async () => {
        setLoading(true);
        const payload = {
            table_id: tableId,
            tenant_id: tenantId,
            manager_id: managerId,
            customer_name: customerName,
            items: selectedItems,
            quantity: selectedItems.map(id => String(quantities[id] || 1)),
            status,
            total_price: String(totalPrice),
            ...(order ? { id: order.id } : {}),
        };

        try {
            const res = await fetch("/api/manager/order", {
                method: order ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                setOpen(false);
                onOrderAdded();
                resetForm();
                toast.success(data.message || (order ? "Order updated successfully" : "Order added successfully"));
            } else {
                toast.error(data.error || "Failed to save order");
            }
        } catch (error) {
            console.error("Order submit error:", error);
            toast.error("Something went wrong while saving order");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        resetForm();
        setOpen(false);
    };

    useEffect(() => {
        if (order) {
            setCustomerName(order.customerName);
            setSelectedItems(order.items);
            setQuantities(
                order.items.reduce((acc: { [key: string]: number }, id, idx) => {
                    acc[id] = Number(order.quantity[idx]);
                    return acc;
                }, {})
            );
            setStatus(order.status);
        } else {
            resetForm();
        }
    }, [order, open]);

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) resetForm();
            setOpen(isOpen);
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{order ? "Update Order" : "Book Order"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        placeholder="Customer Name"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                    />
                    <div>
                        <div className="font-medium mb-2">Select Items</div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {menuItems.map(item => (
                                <div key={item.id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedItems.includes(item.id)}
                                        onChange={() => handleSelectItem(item.id)}
                                    />
                                    <span className="flex-1">{item.item_name} (${item.price})</span>
                                    {selectedItems.includes(item.id) && (
                                        <div className="flex items-center gap-1">
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    handleQuantityChange(item.id, Math.max(1, (quantities[item.id] || 1) - 1))
                                                }
                                                className="w-6 h-6 p-0"
                                            >-</Button>
                                            <span className="px-2 min-w-[1.5rem] text-center">{quantities[item.id] || 1}</span>
                                            <Button
                                                type="button"
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    handleQuantityChange(item.id, (quantities[item.id] || 1) + 1)
                                                }
                                                className="w-6 h-6 p-0"
                                            >+</Button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="font-medium mb-2">Order Status</div>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="preparing">Preparing</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="font-bold text-lg">Total: ${totalPrice.toFixed(2)}</div>
                </div>
                <DialogFooter className="flex justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading || !customerName || selectedItems.length === 0}>
                        {loading ? (order ? "Updating..." : "Booking...") : (order ? "Update Order" : "Book Order")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}