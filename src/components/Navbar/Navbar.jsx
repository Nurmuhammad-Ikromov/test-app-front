import React from "react";

const Navbar = ({ title, name }) => {
    return <div className="flex justify-between items-center mb-6">
        {
            name ? <h1 className="text-3xl font-bold">{title} / {name}</h1> : <h1 className="text-3xl font-bold">{title}</h1>
        }
    </div>;
};

export default Navbar;
