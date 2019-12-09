class Project {

  private readonly _id: string;
  private readonly _projectId: string;
  private readonly _apiEndpoint: string;
  private readonly _service: string;

  constructor(id: string, projectId: string, apiEndpoint: string, service: string) {
    this._id = id;
    this._projectId = projectId;
    this._apiEndpoint = apiEndpoint;
    this._service = service;
  }

  get id(): string {
    return this._id;
  }

  get projectId(): string {
    return this._projectId;
  }

  get apiEndpoint(): string {
    return this._apiEndpoint;
  }

  get service(): string {
    return this._service;
  }

  title(): string {
    return `${this.projectId} ${this.apiEndpoint ? ` / ${this.apiEndpoint}` : ''}`;
  }

  static parse(obj: { [key: string]: any }): Project {
    return new Project(
      obj.id ? obj.id : '',
      obj.projectId ? obj.projectId : '',
      obj.apiEndpoint ? obj.apiEndpoint : '',
      obj.service ? obj.service : ''
    );
  }
}

export default Project;
