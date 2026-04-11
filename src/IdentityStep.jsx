import { useState } from "react";

export default function IdentityStep({ onComplete }) {
  const [fields, setFields] = useState({
    routeName: "",
    orgCode: "",
    ownerName: "",
    contact: ""
  });

  return (
    <div className="flex flex-col items-center justify-center h-full w-full bg-[#f8f9fa]">
      <div className="absolute left-0 top-0" style={{padding: 24}}>
        <div style={{fontWeight: 700, fontSize: 28, letterSpacing: 2}}>TIERA</div>
      </div>
      <div className="flex flex-col gap-6 w-80 mt-20">
        <div className="text-xl font-semibold mb-2 text-center">Route Setup</div>
        <input
          className="border-0 border-b border-[#EDEDED] bg-transparent px-0 py-2 focus:outline-none text-lg font-sans"
          style={{fontFamily: 'Inter'}}
          placeholder="Route Name (optional)"
          value={fields.routeName}
          onChange={e => setFields(f => ({...f, routeName: e.target.value}))}
        />
        <input
          className="border-0 border-b border-[#EDEDED] bg-transparent px-0 py-2 focus:outline-none text-lg font-sans"
          style={{fontFamily: 'Inter'}}
          placeholder="Organization Code (optional)"
          value={fields.orgCode}
          onChange={e => setFields(f => ({...f, orgCode: e.target.value}))}
        />
        <input
          className="border-0 border-b border-[#EDEDED] bg-transparent px-0 py-2 focus:outline-none text-lg font-sans"
          style={{fontFamily: 'Inter'}}
          placeholder="Owner Name (optional)"
          value={fields.ownerName}
          onChange={e => setFields(f => ({...f, ownerName: e.target.value}))}
        />
        <input
          className="border-0 border-b border-[#EDEDED] bg-transparent px-0 py-2 focus:outline-none text-lg font-sans"
          style={{fontFamily: 'Inter'}}
          placeholder="Contact Details (optional)"
          value={fields.contact}
          onChange={e => setFields(f => ({...f, contact: e.target.value}))}
        />
        <button
          className="mt-8 px-6 py-2 rounded bg-black text-white font-semibold text-base hover:bg-[#222] transition"
          style={{ fontFamily: 'Inter', letterSpacing: 1 }}
          onClick={() => onComplete(fields)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
