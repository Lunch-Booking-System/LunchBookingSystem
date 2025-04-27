import React, { useState } from "react";
import { Plus } from "lucide-react";

const MenuCard = ({ item, onOrder, onRemove, dayName, isAdded }) => {
  const [quantity, setQuantity] = useState(1);

  // Guard clause for undefined item
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

  const handleAdd = () => {
    setQuantity(1);
    onOrder(item, 1);
  };

  const markup = calculateMarkUpPrice(item);
  const discount = Math.round(((markup - item.price) / markup) * 100);

  return (
    <div className="relative overflow-hidden bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-orange-200">
      <div className="relative">
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            className="h-52 w-full object-cover"
            alt={item.itemName || "Menu item"}
          />
        )}
        <div className="absolute top-3 right-3 bg-orange-500 px-2 py-1 rounded-full shadow text-white">
          <span className="text-xs font-bold">{discount}% OFF</span>
        </div>
        {item.type && (
          <div className="absolute bottom-3 left-3">
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
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

      <div className="p-5">
        <div className="mb-2">
          <h3 className="text-lg font-bold text-gray-800 line-clamp-2">
            {item.itemName || "Untitled Item"}
          </h3>
        </div>
        <div>
          {item.quantity && (
            <div className="absolute bottom-3 left-3">
              <span className="text-xs px-2 py-1 rounded-full font-medium bg-orange-100 text-orange-800 border border-orange-300">
                {item.quantity || "No"}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-baseline">
            <span className="text-xl font-bold text-orange-600">
              ₹{item.price}
            </span>
            <span className="ml-2 text-sm line-through text-gray-500">
              ₹{markup}
            </span>
          </div>

          <div className="my-2">
            <div className="flex justify-center space-x-10 md:space-x-4">
              {/* <button
            onClick={() => onRemove(item)}
            className="px-4 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 flex items-center"
          >
            Remove{" "}
            <Minus
              size={20}
              strokeWidth={"4px"}
              className="ml-2 font-extrabold"
            />
          </button> */}

              <button
                onClick={() => onOrder(item, quantity)}
                className={`px-4 py-2 text-white rounded-full font-bold flex items-center justify-center transition-all shadow-sm hover:shadow ${
                  isAdded
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
                disabled={isAdded}
              >
                {isAdded ? "Added" : "Add to cart"}
                {!isAdded && <Plus size={18} className="ml-1" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
