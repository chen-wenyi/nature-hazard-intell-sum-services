export default function Header() {
  return (
    <div className="flex items-center h-18 font-bold ml-4">
      <LeftYellowLogo />
      <div className="flex-1 text-2xl ml-8 bg-[#0065B3] h-full flex items-center text-white px-4 py-2">
        Natural Hazard Intelligence Summary
      </div>
    </div>
  )
}

function LeftYellowLogo() {
  return (
    <div className="flex gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="w-6 h-10 bg-[#FFE600] -skew-x-30"></div>
      ))}
    </div>
  )
}
