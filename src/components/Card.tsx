import { useMemo } from 'react';

interface Card {
  title: string;
  target: number;
  diff: number;
}

function Card({ title, target, diff}: Card) {

  const thousandTarget = useMemo(() => {
    if (target < 1) return target
    return target.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }, [target])

  return (
    <div className="card flex flex-col justify-between gap-2">
      <div className='opacity-60'>{title}</div>
      <div className='text-3xl text-center'>{thousandTarget}</div>
      <div className='text-xl text-right'>{diff}%</div>
    </div>
  );
}

export default Card;