import React from 'react'

function Input({img}: {img: string}) {
  return (
    <div className='bg-background-3 text-2xl rounded-2xl p-2 px-3 flex '>
      <input type="number" className='w-full outline-none mr-2' placeholder='0'/>
      <img src={img}/>
    </div>
  )
}

export default Input