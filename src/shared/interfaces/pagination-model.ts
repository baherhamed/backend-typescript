export class PaginationModel {
  totalDocs: number | undefined;
  limit: number | undefined = 0;
  totalPages: number | undefined;
  page: number | undefined;
  pagingCounter: number | undefined;
  hasPrevPage: boolean | undefined = false;
  hasNextPage: boolean | undefined = false;
  prevPage: number | undefined;
  nextPage: number | undefined;
  hasMore: boolean | undefined = false;
  // docs: any[] = [];
}
