import { useState } from "react";
import { getFadeInStyle } from "./getFadeInStyle";

export default function Box() {

  const [show, setShow] = useState("#563512ff"); // Fixed: Added # in initial color
const [showdiv, setShowdiv] = useState(false);

  const mouseLeave = () => {
    setShow("#563512ff"); // Fixed: Added # here as well
    setShowdiv(false);
  };




  const mouseEnter = () => {
    setShow("#16ef1dff");
    setShowdiv(true);
  
  };

  return (

    <>
    <div
      className="d-flex m-5 mm"
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
      style={{
        backgroundColor: show, // Fixed: Using dynamic color from state
        height: "60px",
        width: "60px",
        borderRadius: "12px",
      }}
    >
      one
    </div>

        <div
          className="container mt-3"
          style={{
            ...getFadeInStyle(showdiv,0,0,0,30,30,10),
                 backgroundColor: "red",
            height: "60px",
            width: "60px",
            borderRadius: "12px",
       
          }}
        >
          two
        </div>
        
      <div
          className="container mt-3"
          style={{
            ...getFadeInStyle(showdiv,0,0,0,-30,-30,10),
                 backgroundColor: "red",
            height: "60px",
            width: "60px",
            borderRadius: "12px",
       
          }}
        >
          three
        </div>
        
</>
  );
}
