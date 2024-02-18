import Header from "./components/Header";
import Profile from "./components/Profile";
import { CodeBlock, github } from "react-code-blocks";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Modal, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import Gallery from "./components/Gallery";
import "./styles.css";
import "./App.css";
import logo from "./res/me.jpg";
import Footer from "./components/Footer";
class ThumbCache {
  constructor() {
    this.images = [];
  }

  async parseDBFile(arrayBuffer) {
    this.images = [];
    let index = 0;
    const sig = String.fromCharCode.apply(
      null,
      new Uint8Array(arrayBuffer.slice(index, index + 4))
    );

    if (sig !== "CMMM") {
      throw new Error("Header != CMMM");
    }

    index += 4;

    const ver = new DataView(arrayBuffer, index, 4).getUint32(0, true);
    index += 4;

    const cacheType = new DataView(arrayBuffer, index, 4).getUint32(0, true);
    index += 4;

    const firstOffset = new DataView(arrayBuffer, index, 4).getUint32(0, true);
    index += 4;

    const firstAvailOffset = new DataView(arrayBuffer, index, 4).getUint32(
      0,
      true
    );
    index += 4;

    const numEntries = new DataView(arrayBuffer, index, 4).getUint32(0, true);
    index += 4;

    while (index < arrayBuffer.byteLength) {
      const entrySig = String.fromCharCode.apply(
        null,
        new Uint8Array(arrayBuffer.slice(index, index + 4))
      );
      const lastStart = index;

      index += 4;

      const cacheSize = new DataView(arrayBuffer, index, 4).getUint32(0, true);
      index += 4;

      index += 8; // skip entry hash

      const identifierSize = new DataView(arrayBuffer, index, 4).getInt32(
        0,
        true
      );
      index += 4;

      const paddingSize = new DataView(arrayBuffer, index, 4).getInt32(0, true);
      index += 4;

      const dataSize = new DataView(arrayBuffer, index, 4).getUint32(0, true);
      index += 4;

      index += 4; // skip unknown

      index += 8; // skip data checksum
      index += 8; // skip header checksum

      index += 8; // move 8 for rest to work

      const identifierBytes = new Uint16Array(
        arrayBuffer.slice(index, index + identifierSize)
      );
      const identifier = String.fromCharCode.apply(null, identifierBytes);
      index += identifierSize;

      index += paddingSize;

      const rawImageBytes = new Uint8Array(
        arrayBuffer.slice(index, index + dataSize)
      );
      index += dataSize;

      if (rawImageBytes.length > 0) {
        const newBitmap = await this.getImageFromByteArray(rawImageBytes);
        this.images.push(newBitmap);
      }

      index = lastStart + cacheSize;
    }
  }

  async getImageFromByteArray(byteArray) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([byteArray]);
      const imageUrl = URL.createObjectURL(blob);
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (error) => reject(error);
      image.src = imageUrl;
    });
  }
}
const App = () => {
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileStats, setFileStats] = useState({}); // 파일 이름과 해당 파일에서 추출한 이미지 수를 저장할 상태
  const [selectedFile, setSelectedFile] = useState(null);
  const [filteredImages, setFilteredImages] = useState([]);
  const thumbCache = new ThumbCache();
  const handleFileClick = (fileName) => {
    setSelectedFile(fileName);
    console.log(filteredImages);
  };
  useEffect(() => {
    const filteredImages = selectedFile
      ? images.filter((image) => image.fileName === selectedFile)
      : images;
    setFilteredImages(filteredImages);
  }, [selectedFile, images]);
  const processFile = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      await thumbCache.parseDBFile(arrayBuffer);

      // 각 이미지에 fileName 속성 추가
      const newImages = thumbCache.images.map((image) => ({
        image: image,
        fileName: file.name,
      }));
      console.log(newImages);
      setImages((prevImages) => [...prevImages, ...newImages]);
      // 파일 이름과 해당 파일에서 추출한 이미지 수를 상태에 추가

      setFileStats((prevStats) => ({
        ...prevStats,
        [file.name]: newImages.length,
      }));
    } catch (error) {
      console.error(`Error processing file ${file.name}: `, error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => processFile(file));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".db",
  });

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  return (
    <>
      <div className="App">
        <div className="Content">
          <div className="profile-header">
            <div className="container">
              <div className="profile">
                <div className="profile-image">
                  <img src={logo} width={"240"}></img>
                </div>

                <div className="profile-user-settings">
                  <h1 className="profile-user-name">ThumbCache Viewer</h1>
                </div>

                <div className="profile-stats">
                  <ul>
                    {Object.entries(fileStats).map(
                      ([fileName, imageCount], index) => (
                        <li
                          key={index}
                          onClick={() => handleFileClick(fileName)}
                        >
                          <span className="profile-stat-count">
                            {imageCount}
                          </span>{" "}
                          {fileName}
                        </li>
                      )
                    )}
                  </ul>
                </div>

                <div className="profile-bio">
                  <p>
                    <span className="profile-real-name">
                      ThumbCache_##.db File Path
                    </span>{" "}
                    <CodeBlock
                      theme={github}
                      codeBlock
                      showLineNumbers={false}
                      text="%UserProfile%\AppData\Local\Microsoft\Windows\Explorer"
                    ></CodeBlock>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <main>
            <div className="container">
              <hr></hr>
              <div className="gallery">
                <div
                  {...getRootProps()}
                  className="dropzone"
                  style={{
                    border: "2px dashed #007bff",
                    padding: "20px",
                    textAlign: "center",
                  }}
                >
                  <input {...getInputProps()} />
                  <h3>
                    Drag 'n' drop some files here, or click to select files
                  </h3>
                </div>
                {filteredImages.map((image, index) => (
                  <div key={index}>
                    <div className="gallery-item" tabindex="0">
                      <img
                        loading="lazy"
                        src={image.image.src}
                        alt={`Image ${index}`}
                        width={"285"}
                        height={"270"}
                        style={{ cursor: "pointer" }}
                      />
                      <div
                        className="gallery-item-info"
                        onClick={() => handleImageClick(image)}
                      >
                        <ul>
                          {/* <li className="gallery-item-likes">
                        <span className="visually-hidden">Likes:</span>
                        <i className="fas fa-heart" aria-hidden="true"></i> 56
                      </li>
                      <li className="gallery-item-comments">
                        <span className="visually-hidden">Comments:</span>
                        <i className="fas fa-comment" aria-hidden="true"></i> 2
                      </li> */}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
          <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
            <Modal.Body>
              {selectedImage && (
                <img
                  src={selectedImage.image.src}
                  alt="Full Size"
                  style={{ width: "100%" }}
                />
              )}
            </Modal.Body>
            <Modal.Footer>
              <span>Download</span>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default App;
