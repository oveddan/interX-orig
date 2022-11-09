import { EventEmitter, IScene, Registry } from 'behave-graph';

export class DummyScene implements IScene {
  public onSceneChanged = new EventEmitter<void>();

  constructor(public registry: Registry) {}

  getProperty(jsonPath: string, valueTypeName: string): any {
    return this.registry.values.get(valueTypeName).creator();
  }
  setProperty(): void {
    this.onSceneChanged.emit();
  }
  addOnClickedListener(
    jsonPath: string,
    callback: (jsonPath: string) => void
  ): void {
    throw new Error('Method not implemented.');
  }
}
