import { useEffect } from 'react';

const useDocumentTitle = (title: string) => {
  useEffect(() => {
    document.title = `${title} | Bluekode LMS`;
    return () => { document.title = 'Bluekode LMS'; };
  }, [title]);
};

export default useDocumentTitle;
