import React from 'react'

function Switch({choiceArray, choice, setChoice}: {choiceArray: string[], choice: string, setChoice: React.Dispatch<React.SetStateAction<string>>}) {
  return (
    <div className='flex rounded-2xl bg-background-3'>
        {choiceArray.map((curChoice: string, _)=>{
            return <div key={_} onClick={()=>setChoice(curChoice)} className={`cursor-pointer w-100 rounded-2xl py-3 text-center ${curChoice===choice?'bg-background-4':''}`}>{curChoice}</div>
        })}
    </div>
  )
}

export default Switch