
import "../styles/References.css";

const references = [
  {
    label: "Three.js Documentation",
    url: "https://threejs.org/docs/",
    description: "API reference for the 3D engine used in the project.",
  },
  {
    label: "YouTube Tutorial",
    url: "https://www.youtube.com/watch?v=w2XvGYxQiOk&t=240s",
    description: "Helpful video reference for the carousel-style 3D setup.",
  },
  {
    label: "Original Creator of the 3D models",
    url: "https://www.nintendo.com/en-gb/",
    description: "The original creator of the 3D models used in this project (I didnt invent the NES)."
  },
  {
    label: "Font used",
    url: "https://fontstruct.com/fontstructions/show/406653",
    description: "The NES-style font used across the site.",
  },
  {
    label: "Sound effects for the cartridges",
    url: "https://sounds.spriters-resource.com/nes/",
    description: "Source of the sound effects used for cartridge interactions.",
  },
  {
    label: "Icon used",
    url: "https://www.svgrepo.com/svg/500869/game",
    description: "Game-themed icon used in the interface.",
  },
  {
    label: "React with Three.js",
    url: "https://dev.to/diballesteros/how-to-use-threejs-in-a-react-app-to-render-a-3d-model-gm5",
    description: "Reference for using Three.js inside a React app.",
  },
  {
    label: "Building a React Carousel Component",
    url: "https://www.freecodecamp.org/news/how-to-build-an-image-carousel-component/",
    description: "Guide on implementing carousel patterns in React including auto-scroll and horizontal centering logic.",
  }
];

const References = () => {
  return (
    <div className="page">
      <h1>References</h1>

      <ul className="references-list">
        {references.map((item) => (
          <li key={item.url} className="reference-item">
            <span className="reference-label">{item.label}:</span>{" "}
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              className="link"
            >
              {item.url}
            </a>
            <p className="reference-description">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default References;