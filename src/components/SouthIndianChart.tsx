import React from 'react';
import { ZodiacBox } from '../types';

interface SouthIndianChartProps {
  title: string;
  boxes: ZodiacBox[];
  showAshtakavarga?: boolean;
  id?: string;
}

export const SouthIndianChart: React.FC<SouthIndianChartProps> = ({
  title,
  boxes,
  showAshtakavarga = false,
  id = 'chart'
}) => {
  const getBox = (signId: number): ZodiacBox => {
    return boxes.find(b => b.id === signId) || {
      id: signId,
      nameTamil: '',
      englishName: '',
      planets: [],
      ashtakavargaBindu: 28
    };
  };

  // Traditional South Indian Chart 12 Signs Mapping:
  // Row 1: Pisces (11), Aries (0), Taurus (1), Gemini (2)
  // Row 2: Aquarius (10), [ CENTER 2x2 ], Cancer (3)
  // Row 3: Capricorn (9), [ CENTER 2x2 ], Leo (4)
  // Row 4: Sagittarius (8), Scorpio (7), Libra (6), Virgo (5)
  const pisces = getBox(11);
  const aries = getBox(0);
  const taurus = getBox(1);
  const gemini = getBox(2);

  const aquarius = getBox(10);
  const cancer = getBox(3);

  const capricorn = getBox(9);
  const leo = getBox(4);

  const sagittarius = getBox(8);
  const scorpio = getBox(7);
  const libra = getBox(6);
  const virgo = getBox(5);

  const renderCell = (
    box: ZodiacBox,
    gridPositionClass: string,
    binduPlacement?: 'top' | 'bottom' | 'left' | 'right'
  ) => {
    return (
      <div
        className={`relative flex flex-col justify-between p-1 bg-[#FFFDF5] text-neutral-900 ${gridPositionClass} w-full h-full min-h-[60px] sm:min-h-[68px] overflow-visible`}
      >
        {/* Ashtakavarga Bindus (பரல்கள்) OUTSIDE the outer border via CSS absolute positioning */}
        {showAshtakavarga && box.ashtakavargaBindu !== undefined && binduPlacement && (
          <div
            className={`absolute z-20 text-[10px] font-bold text-amber-950 select-none pointer-events-none ${
              binduPlacement === 'top'
                ? '-top-4 left-1/2 -translate-x-1/2 bg-[#FDF7E3] px-1 rounded-xs border border-amber-900/20'
                : binduPlacement === 'bottom'
                ? '-bottom-4 left-1/2 -translate-x-1/2 bg-[#FDF7E3] px-1 rounded-xs border border-amber-900/20'
                : binduPlacement === 'left'
                ? '-left-4.5 top-1/2 -translate-y-1/2 bg-[#FDF7E3] px-0.5 rounded-xs border border-amber-900/20'
                : '-right-4.5 top-1/2 -translate-y-1/2 bg-[#FDF7E3] px-0.5 rounded-xs border border-amber-900/20'
            }`}
          >
            {box.ashtakavargaBindu}
          </div>
        )}

        {/* Sign Name Header */}
        <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-semibold text-neutral-700 border-b border-neutral-300 pb-0.5 leading-none">
          <span className="truncate">{box.nameTamil}</span>
          {box.isLagna && (
            <span className="text-[8.5px] font-bold text-red-700 bg-red-100 px-0.5 rounded leading-none shrink-0">
              லக்
            </span>
          )}
        </div>

        {/* Planet abbreviations positioned inside cell */}
        <div className="flex flex-wrap gap-x-1 gap-y-0.5 items-center justify-center py-0.5 my-auto content-center">
          {box.planets.length === 0 ? (
            <span className="text-[9px] text-neutral-300 select-none">-</span>
          ) : (
            box.planets.map((planet, pIdx) => {
              const isLagnaTag = planet.includes('லக்');
              const isRetro = planet.includes('(வ)') || planet.includes('(R)');
              return (
                <span
                  key={pIdx}
                  className={`text-[9.5px] sm:text-[10.5px] font-bold leading-tight px-0.5 ${
                    isLagnaTag
                      ? 'text-red-700 underline font-extrabold'
                      : isRetro
                      ? 'text-indigo-900 font-extrabold'
                      : 'text-neutral-900'
                  }`}
                >
                  {planet}
                </span>
              );
            })
          )}
        </div>
      </div>
    );
  };

  return (
    <div id={id} className="relative p-3.5 flex flex-col items-center w-full">
      {/* 4x4 Grid Container (12 Outer Boxes + 1 Center Merged 2x2 Box) */}
      <div className="w-full max-w-[340px] sm:max-w-[360px] aspect-square border-2 border-neutral-900 bg-neutral-900 p-0.5 shadow-md">
        <div className="w-full h-full grid grid-cols-4 grid-rows-4 bg-neutral-900 gap-[1px]">
          
          {/* ROW 1: Pisces, Aries, Taurus, Gemini */}
          {renderCell(pisces, 'col-start-1 row-start-1', 'top')}
          {renderCell(aries, 'col-start-2 row-start-1', 'top')}
          {renderCell(taurus, 'col-start-3 row-start-1', 'top')}
          {renderCell(gemini, 'col-start-4 row-start-1', 'top')}

          {/* ROW 2: Aquarius, [ CENTER MERGED BOX ], Cancer */}
          {renderCell(aquarius, 'col-start-1 row-start-2', 'left')}

          {/* CENTER MERGED BOX: Spans 2 Columns and 2 Rows */}
          <div className="col-start-2 col-span-2 row-start-2 row-span-2 bg-[#FAF1D6] flex flex-col items-center justify-center p-2 text-center border border-neutral-400 select-none shadow-inner">
            <div className="text-base sm:text-xl font-extrabold text-neutral-950 font-tamil tracking-wider">
              {title}
            </div>
            <div className="text-[9px] text-amber-950/70 font-sans uppercase tracking-widest mt-0.5">
              {title === 'இராசி' ? 'Rasi Chakra' : 'Navamsa Chakra'}
            </div>
          </div>

          {renderCell(cancer, 'col-start-4 row-start-2', 'right')}

          {/* ROW 3: Capricorn, [ CENTER MERGED BOX continued ], Leo */}
          {renderCell(capricorn, 'col-start-1 row-start-3', 'left')}
          {renderCell(leo, 'col-start-4 row-start-3', 'right')}

          {/* ROW 4: Sagittarius, Scorpio, Libra, Virgo */}
          {renderCell(sagittarius, 'col-start-1 row-start-4', 'bottom')}
          {renderCell(scorpio, 'col-start-2 row-start-4', 'bottom')}
          {renderCell(libra, 'col-start-3 row-start-4', 'bottom')}
          {renderCell(virgo, 'col-start-4 row-start-4', 'bottom')}

        </div>
      </div>
    </div>
  );
};
