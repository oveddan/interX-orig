import { useEffect, useState } from 'react';
import { parseJsonPath, Path, ResourceTypes, toJsonPathString } from '../../scene/useSceneModifier';
import { IScene } from '../../abstractions';

const PathSelect = ({
  value,
  onChange,
  getProperties,
  short,
}: { value: string; onChange: (path: string | undefined) => void; short: boolean } & Pick<IScene, 'getProperties'>) => {
  const [initialValue] = useState<Path | undefined>(() => {
    console.log('parsing:', value, short);
    if (value) {
      return parseJsonPath(value, short);
    } else return;
  });

  const [resourceType, setResourceType] = useState<ResourceTypes | undefined>(initialValue?.resource);
  const [elementName, setElementName] = useState<string | undefined>(initialValue?.name);
  const [property, setProperty] = useState<string | undefined>(initialValue?.property);

  const [properties] = useState(getProperties());

  useEffect(() => {
    const jsonPath = toJsonPathString(
      {
        name: elementName,
        property: property,
        resource: resourceType,
      },
      short
    );

    console.log('got json path string', jsonPath);

    onChange(jsonPath);
  }, [resourceType, elementName, property, onChange, short]);

  return (
    <>
      <select
        value={resourceType}
        onChange={(e) => setResourceType(e.target.value as ResourceTypes | undefined)}
        className=" bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag"
      >
        <option>--type--</option>
        {Object.keys(properties).map((name) => (
          <option value={name} key={name}>
            {name}
          </option>
        ))}
      </select>
      {resourceType && (
        <select
          value={elementName}
          onChange={(e) => setElementName(e.target.value)}
          className=" bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag"
        >
          <option>--element--</option>
          {properties[resourceType].names.map((name) => (
            <option value={name} key={name}>
              {name}
            </option>
          ))}
        </select>
      )}
      {resourceType && !short && (
        <select
          value={property}
          onChange={(e) => setProperty(e.target.value)}
          className=" bg-gray-600 disabled:bg-gray-700 py-1 px-2 nodrag"
        >
          <option>-property-</option>
          {properties[resourceType].properties.map((property) => (
            <option value={property} key={property}>
              {property}
            </option>
          ))}
        </select>
      )}
    </>
  );
};

export default PathSelect;
