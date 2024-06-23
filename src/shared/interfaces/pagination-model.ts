export class PaginationModel {
  totalDocs: number | undefined;
  limit: number | undefined = 0;
  totalPages: number | undefined;
  page: number | undefined;
  pagingCounter: number | undefined;
  hasPrevPage: Boolean | undefined = false;
  hasNextPage: Boolean | undefined = false;
  prevPage: number | undefined;
  nextPage: number | undefined;
  hasMore: Boolean | undefined = false;
  // docs: any[] = [];
}
