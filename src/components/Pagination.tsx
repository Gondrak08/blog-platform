import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

interface IPagination {
  currentPage: number;
  totalPages: number;
  onPageChange: (pageNumber: number) => void;
}

export default function Pagination(props: IPagination) {
  const { currentPage, totalPages, onPageChange } = props;

  const handlePrevClick = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextClick = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const visiblePageCount = 4;
    const pageNumbers: number[] = [];

    if (totalPages <= visiblePageCount) {
      pageNumbers.push(...Array.from({ length: totalPages }, (_, i) => i + 1));
    } else {
      const firstPage = 0;
      const lastPage = totalPages - 1;

      const midPageCount = visiblePageCount - 2;

      const step = Math.floor(midPageCount / 2);
      pageNumbers.push(firstPage);

      if (currentPage < firstPage + step) {
        pageNumbers.push(...Array.from({ length: Math.min(midPageCount, totalPages) }, (_, i) => firstPage + i + 1));
      } else if (currentPage > lastPage - step) {
        pageNumbers.push(...Array.from({ length: Math.min(midPageCount, totalPages) }, (_, i) => lastPage - midPageCount + i));
      } else {
        const start = currentPage - step;
        pageNumbers.push(...Array.from({ length: midPageCount }, (_, i) => start + i + 1));
      }

      pageNumbers.push(lastPage + 1);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex mx-auto w-fit">
      <ul id="pagination" className="flex items-center font-epilogue font-[500] text-[14px] border border-mv-gray-300 rounded-xl">
        <li className="border-r-[1px] border-r-mv-gray-300">
          <button
            className={`page-item text-sm md:text-md p-2 rounded-md flex items-center gap-3
              ${currentPage === 0 ? 'disable cursor-not-allowed text-mv-blue-200' : 'text-mv-blue-600'}`}
            onClick={handlePrevClick}
            disabled={currentPage === 0}
          >
            <FaArrowLeft className="text-mv-blue-200" />
            Anterior
          </button>
        </li>

        <div className="flex h-full w-full items-center justify-center">
          {pageNumbers.map((pageNumber) => (
            <li
              key={pageNumber - 1} 
              className={`page-item flex items-center w-full h-full border-r-[1px] border-r-mv-gray-300 last:border-r-0
                            ${pageNumber === currentPage + 1 ? 'active text-mv-blue-600' : 'text-mv-blue-200'}`}
            >
              <button className="page-link w-full h-full px-4" onClick={() => onPageChange(pageNumber - 1)}>
                {pageNumber}
              </button>
            </li>
          ))}
        </div>

        <li className="border-l-[1px] border-r-mv-gray-300">
          <button
            className={`page-item text-sm md:text-md p-2 rounded-md flex items-center gap-3 font- ${currentPage === totalPages - 1 ? 'disable cursor-not-allowed text-mv-blue-200' : '  text-mv-blue-600'
              }`}
            onClick={handleNextClick}
            disabled={currentPage === totalPages - 1}
          >
            Próxima
            <FaArrowRight className="text-mv-blue-200" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
