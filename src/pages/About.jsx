import React from 'react';
import Navigation from '../components/Navigation';
import '../styles/About.css';

function About() {
  return (
    <div className='page about-page'>
        <h1>About this Project</h1>

        <h4>Motivation</h4>
        <p className="text-block">I have a flatmate who is obssesed with old Nintendo games and consoles and he recommended that I could try model some of his collection.
          I hadnt used blender before this project but I am a (somewhat decent) <a href="https://nathanielbates.uk" target="_blank" rel="noopener noreferrer" className="link">web developer</a> so i spent some more time on learning blender.
          I am hoping that nintendo doesnt sue me for this.
        </p>

        <h4>Making the Models</h4>
        <p className="text-block">The process of creating the 3D models involved using reference images (font and/or topdown) and creating low-poly versions of the original designs using basic shapes.
          I used basic shapes to create complex models with relatively simple geometry.
        </p>
        
        <div className="model-images">
          <img src="/assets/images/blender.png" alt="Blender Screenshot" className="about-image" />
          <img src="/assets/images/collection.png" alt="NES Collection" className="about-image" />
        </div>

        <p className="text-block">
          Beveling was using for smoohing edges and adding curves and details. UV unwrapping was used to create a 2D representation of the 3D model's surface, allowing for accurate texture mapping.
          I used boolean operations to combine and modify shapes and array modifiers for the repeated lines on cartirdge and NES. Materials are then applied to the models to give them their colours and textures.
        </p>

        <h4>Animations and Interactions</h4>
        <p className="text-block">The animations were super simple to do in blender.First, I would select all the parts of the model that would be moving and seperate them as a seperate object.
          I would then in the animation window move the model to a new posiion for the animation and add the keyframes (its position, rotiation, scale etc.) to the action editor. Then using the animation name, they can be called in ThreeJs in the website.
        </p>

        <h4>Sound Design</h4>
        <p className="text-block">
          For the sounds for the animations I actually recorded them myself using my phone and my flatmates collection. I recorded, cropped and loaded the sounds into the scene.
          I was going to incude more sounds for some variation but i think the single sound for each animation is simple and effective enough for this project.
          Sounds are preloaded and cached in the browser and are triggered by the animation handlers — this keeps latency low and ensures sounds are played in sync with their animations.
        </p>

        <div className="sound-video-grid">
          <div className="sound-video-item">
            <h5>NES system sounds</h5>
            <video controls loop muted className="sound-video">
              <source src="/assets/videos/nes.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="sound-video-item">
            <h5>Controller button sounds</h5>
            <video controls loop muted className="sound-video">
              <source src="/assets/videos/controller.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="sound-video-item">
            <h5>Zapper trigger sounds</h5>
            <video controls loop muted className="sound-video">
              <source src="/assets/videos/zapper.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        <h4>Making the Website</h4>
        <p className="text-block">I built the website using React and Three.js as I am familiar with react and Three.js is what was covered in the labs.
          The hardest bit was honestly getting the carousel on the home page working and looking good, also loading everything from a single config file was a bit awkward but well worth it in the end.
          Doing this in react felt much more manageable than doing it in vanilla js as this project is much more suited for a component based architecture.
          All styling is done with simple css, I could have used tailwind css but it felt a bit overkill.
        </p>

        <h4>Future Work</h4>
        <p className="text-block">If I were to put more time into this project, I would: </p>
        <ul className="future-work-list">
          <li>Make the website much more mobile friendly (barely any support now)</li>
          <li>Add more models to the collection e.g. the gameboy</li>
          <li>Make the animations more complex and add more of them</li>
          <li>Include more sounds for animations and vary between them randomly</li>
          <li>Improve the lighting and materials in the scene to make it look nicer</li>
        </ul>

    </div>
  );
}

export default About;