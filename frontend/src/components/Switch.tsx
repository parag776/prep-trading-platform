import React from 'react'

function Switch({choiceArray, choice, setChoice}: {choiceArray: string[], choice: string, setChoice: React.Dispatch<React.SetStateAction<string>>}) {
  return (
    <div className='flex rounded-xl bg-background-3 w-fit'>
        {choiceArray.map((curChoice: string, i)=>{
            return <div key={i} onClick={()=>setChoice(curChoice)} className={`cursor-pointer rounded-xl py-1 px-4 text-center text-sm ${curChoice===choice?'bg-background-4 text-slate-200':'text-gray-500'}`}>{curChoice}</div>
        })}
    </div>
  )
}

export default Switch