# Models Implementation Guide

## Structure
```
src/models/
├── index.ts           # Model exports
├── types/            # Type definitions
├── base/             # Base model classes
│   ├── Model.ts      # Base model
│   └── Collection.ts # Base collection
├── entities/         # Domain models
│   ├── User.ts       # User model
│   └── Project.ts    # Project model
└── schemas/          # Validation schemas
    ├── user.ts       # User schema
    └── project.ts    # Project schema
```

## Core Features

### Base Model
```typescript
export abstract class Model<T extends Record<string, any>> {
  protected data: T;
  protected schema: Schema<T>;

  constructor(data: T, schema: Schema<T>) {
    this.schema = schema;
    this.data = this.validate(data);
  }

  protected validate(data: T): T {
    const result = this.schema.safeParse(data);
    if (!result.success) {
      throw new ValidationError(result.error);
    }
    return result.data;
  }

  public toJSON(): T {
    return { ...this.data };
  }
}
```

### Entity Implementation
```typescript
export class User extends Model<UserData> {
  constructor(data: UserData) {
    super(data, userSchema);
  }

  get fullName(): string {
    return `${this.data.firstName} ${this.data.lastName}`;
  }

  public updateProfile(data: Partial<UserData>): void {
    const updated = { ...this.data, ...data };
    this.data = this.validate(updated);
  }
}
```

## Implementation Guidelines

### 1. Type Definitions
```typescript
interface BaseModel {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserData extends BaseModel {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}
```

### 2. Validation Schemas
```typescript
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  role: z.enum(['USER', 'ADMIN']),
  createdAt: z.date(),
  updatedAt: z.date(),
});
```

### 3. Collections
```typescript
export class Collection<T extends Model<any>> {
  protected items: Map<string, T>;

  constructor(items: T[] = []) {
    this.items = new Map(
      items.map(item => [item.id, item])
    );
  }

  public add(item: T): void {
    this.items.set(item.id, item);
  }

  public remove(id: string): boolean {
    return this.items.delete(id);
  }

  public find(predicate: (item: T) => boolean): T | undefined {
    return Array.from(this.items.values()).find(predicate);
  }
}
```

## Best Practices

### Model Design
- Immutable data
- Validation on construction
- Type safety
- Encapsulation
- Domain logic isolation

### Performance
- Lazy loading
- Caching
- Batch operations
- Memory management
- Efficient queries

### Error Handling
```typescript
export class ValidationError extends Error {
  constructor(public errors: ValidationError[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class ModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ModelError';
  }
}
```

## Testing

### Unit Tests
```typescript
describe('User Model', () => {
  it('should create valid user', () => {
    const userData = {
      id: 'uuid',
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const user = new User(userData);
    expect(user.toJSON()).toEqual(userData);
  });

  it('should throw on invalid data', () => {
    expect(() => new User({
      ...validUserData,
      email: 'invalid',
    })).toThrow(ValidationError);
  });
});
```

## Relationships

### One-to-One
```typescript
export class User extends Model<UserData> {
  private _profile?: Profile;

  async getProfile(): Promise<Profile> {
    if (!this._profile) {
      this._profile = await Profile.findByUserId(this.id);
    }
    return this._profile;
  }
}
```

### One-to-Many
```typescript
export class Project extends Model<ProjectData> {
  private _tasks?: Collection<Task>;

  async getTasks(): Promise<Collection<Task>> {
    if (!this._tasks) {
      const tasks = await Task.findByProjectId(this.id);
      this._tasks = new Collection(tasks);
    }
    return this._tasks;
  }
}
```

### Many-to-Many
```typescript
export class User extends Model<UserData> {
  async getProjects(): Promise<Collection<Project>> {
    const projectIds = await UserProject.findProjectsByUserId(this.id);
    return Project.findByIds(projectIds);
  }

  async addToProject(project: Project): Promise<void> {
    await UserProject.create({
      userId: this.id,
      projectId: project.id,
    });
  }
}
```

## Persistence

### Repository Pattern
```typescript
export abstract class Repository<T extends Model<any>> {
  abstract create(data: Omit<T, 'id'>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<T | null>;
  abstract findMany(query: Query<T>): Promise<Collection<T>>;
}
```

### Database Integration
```typescript
export class UserRepository extends Repository<User> {
  async create(data: CreateUserData): Promise<User> {
    const result = await prisma.user.create({
      data: {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return new User(result);
  }
}
```

## Events

### Model Events
```typescript
export abstract class Model<T> {
  protected events = new EventEmitter();

  protected emit(event: string, data?: any): void {
    this.events.emit(event, data);
  }

  public on(event: string, handler: (data: any) => void): void {
    this.events.on(event, handler);
  }
}
```

### Event Handling
```typescript
export class User extends Model<UserData> {
  async updateProfile(data: Partial<UserData>): Promise<void> {
    const oldData = { ...this.data };
    this.data = this.validate({ ...this.data, ...data });
    this.emit('updated', { old: oldData, new: this.data });
  }
}
```

## Documentation

### JSDoc Comments
```typescript
/**
 * Base model class providing common functionality
 * @template T - The data type for the model
 */
export abstract class Model<T extends Record<string, any>> {
  /**
   * Creates a new model instance
   * @param data - The initial data
   * @param schema - The validation schema
   * @throws {ValidationError} If data is invalid
   */
  constructor(data: T, schema: Schema<T>) {
    // Implementation
  }
}
```

## Migration Support
```typescript
export abstract class Model<T> {
  static migrations: Migration[] = [];

  static registerMigration(migration: Migration): void {
    this.migrations.push(migration);
  }

  async migrate(): Promise<void> {
    for (const migration of Model.migrations) {
      if (await migration.shouldApply(this)) {
        await migration.apply(this);
      }
    }
  }
}
```

## Serialization

### JSON Serialization
```typescript
export abstract class Model<T> {
  toJSON(): Record<string, any> {
    return {
      ...this.data,
      _type: this.constructor.name,
    };
  }

  static fromJSON(json: string): Model<any> {
    const data = JSON.parse(json);
    const ModelClass = modelRegistry.get(data._type);
    return new ModelClass(data);
  }
}
```

## Caching

### Model Cache
```typescript
export class ModelCache<T extends Model<any>> {
  private cache = new Map<string, T>();

  get(id: string): T | undefined {
    return this.cache.get(id);
  }

  set(model: T): void {
    this.cache.set(model.id, model);
  }

  invalidate(id: string): void {
    this.cache.delete(id);
  }
}
```
