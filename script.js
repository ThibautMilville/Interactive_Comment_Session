// Class to recuperate and use the data from the JSON file
class JSONLoader {
  constructor (path) {
    this.path = path;
    this.data = null;
  }

  // Method to load the JSON file
  loadJSON () {
    fetch(this.path)
      .then(response => response.json())
      .then(data => {
        this.data = data;
        this.changePicture();
      })
      .catch(error => console.error('An error has occured: ', error));
  }

  // Check if the browser supports webp format
  async supportWebp () {
    try {
      const response = await fetch(this.data.currentUser.image.webp, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false; // If the browser doesn't support webp, return false
    }
  }

  // Change the picture of the current user (WEBP or JPG)
  changePicture () {
    const picture = document.querySelector('img.current-user');
    this.supportWebp().then(supported => {
      if (supported) {
        picture.src = this.data.currentUser.image.webp;
      } else {
        picture.src = this.data.currentUser.image.jpg;
      }
    });
  }
}

const loader = new JSONLoader('data.json');
loader.loadJSON();