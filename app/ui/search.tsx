'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
// adding to update URL with what we search
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
// add debouncing to optimize making calls to server as we search
import { useDebouncedCallback } from 'use-debounce';

export default function Search({ placeholder }: { placeholder: string }) {
  // adding
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter(); // replace method from useRouter()

  //function handleSearch(term: string) {
  const handleSearch = useDebouncedCallback((term) => {
    console.log(`Searching... ${term}`);
    //console.log(term);
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // set page # to 1 when user types new query
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`); // ${pathname} is current pathname (i.e. /dashboard/invoices)
  }, 300); // add time for debounce, 300ms. Otherwise, we call server every keystroke!
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
        // adding listener
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get('query')?.toString()} // ensure input field syncs with URL
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
