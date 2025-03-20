import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

const MenuCard = ({ item, onOrder, onRemove, dayName }) => {
  const [quantity, setQuantity] = useState(0);

  // Guard clause to prevent errors if item is undefined
  if (!item) {
    return <div className="p-4 rounded-xl shadow-md border border-gray-100">Loading item...</div>;
  }

  const calculateMarkUpPrice = (item) => {
    return item.price + 10;
  };

  const handleAdd = () => {
    setQuantity(1);
    onOrder(item, 1);
  };

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
    onOrder(item, 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
      onRemove(item);
    } else {
      setQuantity(0);
      onRemove(item);
    }
  };

  const markup = calculateMarkUpPrice(item);
  const discount = Math.round(((markup - item.price) / markup) * 100);

  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg">
      <div className="relative">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            className="h-48 w-full object-cover"
            alt={item.itemName || "Menu item"}
          />
        )}
        <div className="absolute top-3 right-3 bg-orange-500 px-2 py-1 rounded-md shadow-sm">
          <span className="text-xs font-bold text-white">{discount}% OFF</span>
        </div>
        {item.type && (
          <div className="absolute bottom-3 left-3">
            <span
              className={`text-xs px-2 py-1 rounded-md font-medium ${
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

      <div className="p-4">
        <div className="mb-1">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
            {item.itemName || "Untitled Item"}
          </h3>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-orange-600">₹{item.price}</span>
            <span className="ml-2 text-sm line-through text-gray-500">
              ₹{markup}
            </span>
          </div>
          
          <div className="flex items-center">
            {quantity === 0 ? (
              <button
                onClick={handleAdd}
                className="py-1 px-3 bg-orange-500 text-white font-medium rounded-lg text-sm shadow-sm hover:bg-orange-600 focus:outline-none transition-colors duration-200 flex items-center"
              >
                <span>ADD</span>
                <Plus size={16} className="ml-1" strokeWidth={2.5} />
              </button>
            ) : (
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={handleDecrease}
                  className="p-1 bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  <Minus size={16} strokeWidth={2.5} />
                </button>
                <span className="px-3 font-medium text-gray-800">{quantity}</span>
                <button
                  onClick={handleIncrease}
                  className="p-1 bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  <Plus size={16} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;