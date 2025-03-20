import React, { useState } from "react";
import { Plus } from "lucide-react";

const MenuCard = ({ item, onOrder, onRemove, dayName, isAdded }) => {
  const [quantity, setQuantity] = useState(1);

  if (!item) {
    return (
      <div className="p-4 rounded-xl shadow-md border border-gray-100 bg-gray-50 flex items-center justify-center h-56">
        <span className="text-gray-400">Loading item...</span>
      </div>
    );
  }

  const calculateMarkUpPrice = (item) => {
    return item.price + 10;
  };

  const markup = calculateMarkUpPrice(item);

  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-orange-200">
      <div className="relative">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            className="w-full object-cover h-40 md:h-52"
            alt={item.itemName || "Menu item"}
          />
        )}
        {item.type && (
          <div className="absolute bottom-3 left-3">
            <span
              className={`text-xs md:text-sm px-2 py-1 rounded-full font-medium ${
                item.type === "Veg"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              {item.type}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 md:p-5">
        <div className="mb-2">
          <h3 className="text-base md:text-lg font-bold text-gray-800 line-clamp-2">
            {item.itemName || "Untitled Item"}
          </h3>
        </div>
        {item.quantity && (
          <div className="absolute top-3 right-3">
            <span className="text-xs md:text-sm px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-800 border border-orange-300">
              {item.quantity || "No"}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline">
            <span className="text-lg md:text-xl font-bold text-orange-600">
              ₹{item.price}
            </span>
            <span className="ml-2 text-sm md:text-base line-through text-gray-500">
              ₹{markup}
            </span>
          </div>

          <div>
            <button
              onClick={() => onOrder(item, quantity)}
              className={`flex items-center justify-center transition-all shadow-sm hover:shadow rounded-full ${
                isAdded
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-orange-500 hover:bg-orange-600"
              } text-white text-xs md:text-sm px-3 md:px-5 py-2 w-full sm:w-auto`}
              disabled={isAdded}
            >
              {isAdded ? "Added" : "Add to cart"}
              {!isAdded && <Plus size={16} className="ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
