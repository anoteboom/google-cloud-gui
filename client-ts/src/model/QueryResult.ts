export class QueryResult {
  entities: { [key: string]: any }[];
  next: QueryResultNext;

  constructor(entities: { [key: string]: any }[], next: QueryResultNext) {
    this.entities = entities;
    this.next = next;
  }

  static parse(obj: { [key: string]: any }): QueryResult {
    return new QueryResult(
      Array.isArray(obj.entities) ? obj.entities : [],
      obj.next ? QueryResultNext.parse(obj.next) : new QueryResultNext('', ''),
    );
  }
}

export class QueryResultNext {
  moreResults: string;
  endCursor: string;

  constructor(moreResults: string, endCursor: string) {
    this.moreResults = moreResults;
    this.endCursor = endCursor;
  }

  static parse(obj: { [key: string]: any }): QueryResultNext {
    return new QueryResultNext(
      obj.moreResults ? obj.moreResults : '',
      obj.endCursor ? obj.endCursor : '',
    );
  }
}
