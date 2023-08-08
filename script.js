// Class to recuperate and use the data from the JSON file
class JSONLoader {
  constructor(path) {
    this.path = path;
    this.data = null;

    this.commentSection = document.querySelector('section.comments');
  }

  // Method to load the JSON file
  loadJSON() {
    fetch(this.path)
      .then(response => response.json())
      .then(data => {
        this.data = data;
        // Create the sections with the data
        this.loadComments(this.data);
        this.changePicture(this.data);

        // Listen to the click on the like and dislike buttons
        this.likeOrDislike(this.data);
      })
      .catch(error => console.error('An error has occured: ', error));
  }

  // Load the comments and replies
  loadComments(data) {
    for (let i = 0; i < data.comments.length; i++) {
      this.createComment(data, i);
      // If there are replies, create them
      if (data.comments[i].replies) {
        for (let j = 0; j < data.comments[i].replies.length; j++) {
          this.createReply(data, i, j);
        }
      }
    }
  }

  // Create a comment
  createComment(data, i) {
    this.commentSection.innerHTML += `
    <div id="comments${i}" class="comments">
      <div class="comment">
        <div class="likes">
          <img src="./images/icon-plus.svg" id="like" alt="Plus icon">
          <p class="nb-likes">${data.comments[i].score}</p>
          <img src="./images/icon-minus.svg" id="dislike" alt="Minus icon">
        </div>
        <div class="comment-content">
          <div class="post-info">
            <div class="left">
              <img src="${this.checkPicture(data.comments[i].user.image.webp, data.comments[i].user.image.png)}" alt="picture">
              <p class="profile-name">${data.comments[i].user.username}</p>
              <p class="post-date">${data.comments[i].createdAt}</p>
            </div>
            <div class="action">
              <p class="reply"><img src="images/icon-reply.svg" alt="reply">Reply</p>
            </div>
          </div>
          <p class="content">${data.comments[i].content}</p>
        </div>
      </div>
    </div>
    `;
  }

  // Create a reply
  createReply(data, i, j) {
    const comments = document.querySelector(`#comments${i}`);
    comments.innerHTML += `
    <div class="replies">
      <div id="reply${i+j+1}">
        <div class="likes">
          <img src="./images/icon-plus.svg" id="like" alt="Plus icon">
          <p class="nb-likes">${data.comments[i].replies[j].score}</p>
          <img src="./images/icon-minus.svg" id="dislike" alt="Minus icon">
        </div>
        <div class="comment-content">
          <div class="post-info">
            <div class="left">
              <img src="${this.checkPicture(data.comments[i].replies[j].user.image.webp, data.comments[i].replies[j].user.image.png)}" alt="picture">
              <p class="profile-name">${data.comments[i].replies[j].user.username}</p>
              ${this.checkCommentCurrentUser(data, i, j) ? '<p class="current-user">you</p>' : ''}
              <p class="post-date">${data.comments[i].replies[j].createdAt}</p>
            </div>
            <div class="action">
              <!-- If the current user is the same as the user who posted the comment or the reply, display the delete and edit buttons, else display the reply button -->
              ${this.checkCommentCurrentUser(data, i, j) ? '<p class="delete"><img src="images/icon-delete.svg" alt="delete">Delete</p>' : ''}
              ${this.checkCommentCurrentUser(data, i, j) ? '<p class="edit"><img src="images/icon-edit.svg" alt="edit">Edit</p>' : '<p class="reply"><img src="images/icon-reply.svg" alt="reply">Reply</p>'}
            </div>
          </div>
          <p class="content">${data.comments[i].replies[j].content}</p>
        </div>
      </div>
    </div>
    `;
  }

  // Change the picture of the current user (WEBP or JPG)
  changePicture(data) {
    const picture = document.querySelector('img.current-user');
    this.supportWebp(data.currentUser.image.webp).then(supported => {
      if (supported) {
        picture.src = data.currentUser.image.webp;
      } else {
        picture.src = data.currentUser.image.jpg;
      }
    });
  }

  // Check if the browser supports webp format and return true or false
  async supportWebp(image) {
    try {
      const response = await fetch(image, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false; // If the browser doesn't support webp, return false
    }
  }

  // Check if the browser supports webp format and return the correct picture
  checkPicture(webp, png) {
    if (this.supportWebp(webp)) {
      return webp;
    } else {
      return png;
    }
  }

  // Check if the current user is the same as the user who posted the comment or the reply
  checkCommentCurrentUser(data, i, j) {
    if (data.currentUser.username === data.comments[i].user.username || data.currentUser.username === data.comments[i].replies[j].user.username) {
      return true;
    } else {
      return false;
    }
  }

  // Function with an event listener to like or dislike a comment or a reply
  likeOrDislike(data) {
    const likes = document.querySelectorAll('.likes');
    const currentUser = data.currentUser.username;

    // For each click on the like and dislike buttons
    likes.forEach(like => {
      // Get the number of likes, the like and dislike buttons
      const nbLikes = like.querySelector('.nb-likes');
      const likeButton = like.querySelector('#like');
      const dislikeButton = like.querySelector('#dislike');

      // Get the name of the author of the comment or the reply
      const authorComment = like.closest('.comment, [id^="reply"]').querySelector('.profile-name').innerHTML;

      // Like event listener except if the current user is the same as the author of the comment or the reply
      likeButton.addEventListener('click', () => {
        if (!likeButton.classList.contains('liked') && currentUser !== authorComment) {
          // Change the score in the JSON file (non-functional, need to use a server)
          // data.comments[like.closest('[id^="comments"], [id^="reply"]').id.slice(-1)].score += 1;
          
          nbLikes.innerHTML = parseInt(nbLikes.innerHTML) + 1;
          likeButton.classList.add('liked');
          dislikeButton.classList.remove('disliked');
        }
      });

      // Dislike event listener except if the current user is the same as the author of the comment or the reply
      dislikeButton.addEventListener('click', () => {
        if (!dislikeButton.classList.contains('disliked') && currentUser !== authorComment) {
          // Change the score in the JSON file (non-functional, need to use a server)
          // data.comments[like.closest('[id^="comments"], [id^="reply"]').id.slice(-1)].score -= 1;

          nbLikes.innerHTML = parseInt(nbLikes.innerHTML) - 1;
          dislikeButton.classList.add('disliked');
          likeButton.classList.remove('liked');
        }
      });
    });
  }
}

const loader = new JSONLoader('data.json');
loader.loadJSON();