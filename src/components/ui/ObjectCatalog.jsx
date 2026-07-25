import { categories, objectCatalog } from "../../data/objectCatalog";
import { useEditorStore } from "../../store/useEditorStore";

export default function ObjectCatalog() {
  const activeCategory = useEditorStore((s) => s.activeCategory);
  const setActiveCategory = useEditorStore((s) => s.setActiveCategory);
  const addObject = useEditorStore((s) => s.addObject);
  const room = useEditorStore((s) => s.room);

  const items = objectCatalog.filter(
    (item) => item.category === activeCategory
  );

  const handleAdd = (catalogId) => {
    // Ceiling light snaps near ceiling; wall items slightly above floor
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

    if (catalogId === "wall-art" || catalogId === "mirror") {
      addObject(catalogId, {
        position: {
          x: 0,
          y: room.floorThickness + 1.2,
          z: -room.depth / 2 + 0.08,
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
        <p>Furniture &amp; interior props</p>
      </header>

      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={
              activeCategory === cat.id ? "tab active" : "tab"
            }
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
            <span
              className="catalog-swatch"
              style={{ background: item.defaultColor }}
            />
            <span className="catalog-label">{item.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
