import { Plus, Minus } from "lucide-react";
import React, { useState } from "react";

const MenuCard = ({ item, onOrder, onRemove, dayName }) => {
  const [quantity, setQuantity] = useState(1);

  const calculateMarkUpPrice = (item) => {
    return item.price + 10;
  };

  return (
    <div key={item._id} className="mb-5 shadow-xl rounded-2xl mx-1 p-2 md:w-[280px] lg:w-[350px] border border-slate-100">
      <img
        src={item.imageUrl}
        className="rounded-xl shadow-xl h-[150px] w-full object-cover"
        alt={item.itemName}
      />
      <p className="my-2 ml-2">
        <span className="font-bold text-2xl">₹ {item.price}</span>
        <span className="line-through text-xl ml-2 text-gray-600">
          ₹ {calculateMarkUpPrice(item)}
        </span>
      </p>
      <div className="ml-2 my-5">
        <h3 className="text-xl font-bold mb-2">
          {item.itemName}
          <span>
            <button
              className={`text-sm ml-2 p-1 border-dashed ${
                item.type === "Veg"
                  ? "bg-green-200 border border-green-400 rounded-xl text-green-700"
                  : "bg-red-200 border border-red-400 rounded-xl text-red-700"
              }`}
            >
              {item.type}
            </button>
          </span>
        </h3>
        {/* <p className=" text-md text-gray-400">{item.description}</p> */}
      </div>

      <div className="my-2">
        <div className="flex justify-center space-x-10 md:space-x-4">
          <button
            onClick={() => onRemove(item)}
            className="px-4 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 flex items-center"
          >
            Remove{" "}
            <Minus
              size={20}
              strokeWidth={"4px"}
              className="ml-2 font-extrabold"
            />
          </button>

          <button
            onClick={() => onOrder(item, quantity)}
            className="px-4 py-3 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 flex items-center"
          >
            Add{" "}
            <Plus
              size={20}
              strokeWidth={"4px"}
              className="ml-2 font-extrabold"
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuCard;
