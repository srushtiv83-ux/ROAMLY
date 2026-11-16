import { useMemo } from 'react';
import { useRoamly } from '../context/RoamlyContext';
import { destinationService } from '../services/destinationService';

export function useBookmarks() {
  const { bookmarks, toggleBookmark, isBookmarked } = useRoamly();

  const savedDestinations = useMemo(() => {
    return bookmarks
      .map((id) => destinationService.getById(id))
      .filter((d): d is NonNullable<typeof d> => Boolean(d));
  }, [bookmarks]);

  return {
    bookmarkIds: bookmarks,
    savedDestinations,
    toggleBookmark,
    isBookmarked,
  };
}
