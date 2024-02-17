import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Modal, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
class ThumbCache {
  constructor() {
    this.images = [];
  }

  async parseDBFile(arrayBuffer) {
    this.images = [];
    let index = 0;
    const sig = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer.slice(index, index + 4)));

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

    const firstAvailOffset = new DataView(arrayBuffer, index, 4).getUint32(0, true);
    index += 4;

    const numEntries = new DataView(arrayBuffer, index, 4).getUint32(0, true);
    index += 4;

    while (index < arrayBuffer.byteLength) {
      const entrySig = String.fromCharCode.apply(null, new Uint8Array(arrayBuffer.slice(index, index + 4)));
      const lastStart = index;

      index += 4;

      const cacheSize = new DataView(arrayBuffer, index, 4).getUint32(0, true);
      index += 4;

      index += 8; // skip entry hash

      const identifierSize = new DataView(arrayBuffer, index, 4).getInt32(0, true);
      index += 4;

      const paddingSize = new DataView(arrayBuffer, index, 4).getInt32(0, true);
      index += 4;

      const dataSize = new DataView(arrayBuffer, index, 4).getUint32(0, true);
      index += 4;

      index += 4; // skip unknown

      index += 8; // skip data checksum
      index += 8; // skip header checksum

      index += 8; // move 8 for rest to work

      const identifierBytes = new Uint16Array(arrayBuffer.slice(index, index + identifierSize));
      const identifier = String.fromCharCode.apply(null, identifierBytes);
      index += identifierSize;

      index += paddingSize;

      const rawImageBytes = new Uint8Array(arrayBuffer.slice(index, index + dataSize));
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
function App() {
  const [images, setImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const thumbCache = new ThumbCache();

  const processFile = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      await thumbCache.parseDBFile(arrayBuffer);
      setImages((prevImages) => [...prevImages, ...thumbCache.images]);
    } catch (error) {
      console.error(`Error processing file ${file.name}: `, error);
    }
  };

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => processFile(file));
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: '.db'
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
    <div>
      <div {...getRootProps()} className="dropzone" style={{ border: '2px dashed #007bff', padding: '20px', textAlign: 'center' }}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      <div>
        <center>
          {images.map((image, index) => (
            <img
              key={index}
              src={image.src}
              alt={`Image ${index}`}
              width={"300"}
              height={"300"}
              onClick={() => handleImageClick(image)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </center>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Image Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedImage && <img src={selectedImage.src} alt="Full Size" style={{ width: '100%' }} />}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default App;
