import {
  categories,
  categoryBadge,
  objectCatalog,
} from "../../data/objectCatalog";
import { useEditorStore } from "../../store/useEditorStore";
import CatalogThumb from "./CatalogThumb";

const tabs = [{ id: "all", label: "All" }, ...categories];
const knownCats = new Set(categories.map((c) => c.id));

export default function ObjectCatalog() {
  const activeCategory = useEditorStore((s) => s.activeCategory);
  const setActiveCategory = useEditorStore((s) => s.setActiveCategory);
  const addObject = useEditorStore((s) => s.addObject);
  const room = useEditorStore((s) => s.room);

  const filterId = knownCats.has(activeCategory) ? activeCategory : "all";

  const items =
    filterId === "all"
      ? objectCatalog
      : objectCatalog.filter((item) => item.category === filterId);

  const handleAdd = (catalogId) => {
    if (catalogId === "ceiling-light") {
      addObject(catalogId, {
        position: {
          x: 0,
          y: room.floorThickness + room.height - 0.25,
          z: 0,
        },
      });
      return;
    }

    if (
      catalogId === "wall-art" ||
      catalogId === "mirror" ||
      catalogId === "towel-rack" ||
      catalogId === "upper-cabinet"
    ) {
      const y =
        catalogId === "upper-cabinet"
          ? room.floorThickness + 1.55
          : catalogId === "towel-rack"
            ? room.floorThickness + 1.35
            : room.floorThickness + 1.2;
      addObject(catalogId, {
        position: {
          x: 0,
          y,
          z: -room.depth / 2 + 0.1,
        },
      });
      return;
    }

    addObject(catalogId);
  };

  return (
    <section className="panel catalog-panel">
      <header className="panel-header">
        <h2>Objects</h2>
        <p>Furniture, interior, bath &amp; kitchen</p>
      </header>

      <div className="category-tabs wrap">
        {tabs.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={filterId === cat.id ? "tab active" : "tab"}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="catalog-grid">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="catalog-item"
            onClick={() => handleAdd(item.id)}
            title={`Add ${item.label}`}
          >
            <span className="catalog-thumb">
              <CatalogThumb catalogId={item.id} color={item.defaultColor} />
              <span className={`catalog-badge ${item.category}`}>
                {categoryBadge(item.category)}
              </span>
            </span>
            <span className="catalog-label">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
