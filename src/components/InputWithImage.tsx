import React from 'react'

type InputWithImageProps = {
  img: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

const InputWithImage = React.forwardRef<HTMLInputElement, InputWithImageProps>(
  ({ img, ...inputProps }, ref) => (
    <div className='bg-background-3 text-2xl rounded-2xl p-2 px-3 flex '>
      <input type="number" className='w-full outline-none mr-2' placeholder='0' {...inputProps} ref={ref}/>
      <img src={img}/>
    </div>
  )
);

export default InputWithImage