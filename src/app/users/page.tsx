"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const products = [
  {
    id: 1,
    name: "Chocolate Cake",
    price: "15.00$",
    category: "Food",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },
  {
    id: 2,
    name: "Cold Coffee",
    price: "10.00$",
    category: "Drink",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },
  {
    id: 3,
    name: "Orange Juice",
    price: "8.00$",
    category: "Beverages",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },
  {
    id: 4,
    name: "Gift Box",
    price: "20.00$",
    category: "Products",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },
  {
    id: 5,
    name: "Chocolate Cake",
    price: "15.00$",
    category: "Food",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },
  {
    id: 6,
    name: "Cold Coffee",
    price: "10.00$",
    category: "Drink",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },
  {
    id: 7,
    name: "Orange Juice",
    price: "8.00$",
    category: "Beverages",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },
  {
    id: 8,
    name: "Gift Box",
    price: "20.00$",
    category: "Products",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },
  {
    id: 9,
    name: "Chocolate Cake",
    price: "15.00$",
    category: "Food",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },
  {
    id: 10,
    name: "Cold Coffee",
    price: "10.00$",
    category: "Drink",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },
  {
    id: 11,
    name: "Orange Juice",
    price: "8.00$",
    category: "Beverages",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },
  {
    id: 12,
    name: "Gift Box",
    price: "20.00$",
    category: "Products",
    image:
      "https://gratisography.com/wp-content/uploads/2024/11/gratisography-augmented-reality-800x525.jpg",
  },

];

export default function Page() {
  const [activeCategory, setActiveCategory] = useState("Food");

  const categories = ["Food", "Drink", "Beverages", "Products"];

  // filter products by category
  const filteredProducts = products.filter(
    (p) => p.category === activeCategory
  );

  return (
    <div className="container mx-auto bg-[#2c2c2c] min-h-screen">
      <div className="w-full py-8">
        {/* Header (Categories) */}
        <div className="flex flex-wrap lg:flex-nowrap items-center mb-6 gap-4 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm sm:text-base font-semibold transition whitespace-nowrap
                ${activeCategory === cat
                  ? "bg-white text-[#2c2c2c]"
                  : "bg-[#3a3a3a] text-white hover:bg-[#444444]"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile -> Slider */}
        <div className="block lg:hidden">
          <Swiper spaceBetween={16} slidesPerView={1.2}>
            {filteredProducts.map((p) => (
              <SwiperSlide key={p.id}>
                <div className="bg-[#3a3a3a] rounded-2xl shadow-md p-4">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="rounded-xl w-full h-40 object-cover"
                  />
                  <h3 className="mt-3 text-sm font-medium text-white">
                    {p.name}
                  </h3>
                  <p className="mt-1 font-semibold text-gray-200">{p.price}</p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Desktop -> Grid */}
        <div className="hidden lg:grid grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-[#3a3a3a] rounded-2xl shadow-md p-4 hover:shadow-lg hover:bg-[#444444] transition"
            >
              <img
                src={p.image}
                alt={p.name}
                className="rounded-xl w-full h-40 object-cover"
              />
              <h3 className="mt-3 text-sm font-medium text-white">{p.name}</h3>
              <p className="mt-1 font-semibold text-gray-200">{p.price}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}