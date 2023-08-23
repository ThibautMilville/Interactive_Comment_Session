// Class to recuperate and use the data from the JSON file
class JSONLoader {
  constructor(path) {
    // Path of the JSON file and data
    this.path = path;
    this.data = null;

    // DOM elements
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

        // Event listeners
        this.likeOrDislike(this.data);
        this.showDeleteModal();
        this.editComment();
        this.addReply();
      })
      .catch(error => console.error('An error has occured: ', error));
  }

  // Load the comments and replies
  loadComments(data) {
    for (let i = 0; i < data.comments.length; i++) {
      // Get the id of the comment
      const commentId = data.comments[i].id;
      this.createComment(data, i, commentId);
      // If there are replies, create them
      if (data.comments[i].replies) {
        for (let j = 0; j < data.comments[i].replies.length; j++) {
          // Get the id of the reply
          const replyId = data.comments[i].replies[j].id;
          this.createReply(data, i, j, commentId, replyId);
        }
      }
    }
  }

  // Create a comment
  createComment(data, i, commentId) {
    this.commentSection.innerHTML += `
    <div id="comments${commentId}" class="comments">
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
            <!-- If the current user is the same as the user who posted the comment or the reply, display the delete and edit buttons, else display the reply button -->
            ${this.checkCommentCurrentUser(data, i) ? '<button class="delete"><img src="images/icon-delete.svg" alt="delete">Delete</button>' : ''}
            ${this.checkCommentCurrentUser(data, i) ? '<button class="edit"><img src="images/icon-edit.svg" alt="edit">Edit</button>' : '<button class="reply"><img src="images/icon-reply.svg" alt="reply">Reply</button>'}
          </div>
          </div>
          <p class="content">${data.comments[i].content}</p>
        </div>
      </div>
      ${data.comments[i].replies != '' ? `
        <div class="replies">
        </div>
        ` : ''}
    </div>
    `;
  }

  // Create a reply
  createReply(data, i, j, commentId, replyId) {
    const comments = document.querySelector(`#comments${commentId} .replies`);
    comments.innerHTML += `
    <div id="reply${replyId}">
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
            ${this.checkCommentCurrentUser(data, i, j) ? '<button class="delete"><img src="images/icon-delete.svg" alt="delete">Delete</button>' : ''}
            ${this.checkCommentCurrentUser(data, i, j) ? '<button class="edit"><img src="images/icon-edit.svg" alt="edit">Edit</button>' : '<button class="reply"><img src="images/icon-reply.svg" alt="reply">Reply</button>'}
          </div>
        </div>
        <p class="content">${data.comments[i].replies[j].content}</p>
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
    // Get the name of the user who posted the comment or the reply
    const commentUser = data.comments[i].user.username;
    const replyUser = j !== undefined ? data.comments[i].replies[j]?.user.username : undefined; // Check if "j" is defined, if not it means it is a comment and not a reply, return undefined

    // Return true if the current user is the same as the user who posted the comment or the reply, else return false
    return data.currentUser.username === commentUser || data.currentUser.username === replyUser;
  }

  // Get the last id in the data
  getLastId(data) {
    let lastId = 0;
    for (let i = 0; i < data.comments.length; i++) {
      if (data.comments[i].replies) {
        for (let j = 0; j < data.comments[i].replies.length; j++) {
          if (data.comments[i].replies[j].id > lastId) {
            lastId = data.comments[i].replies[j].id;
          }
        }
      }
    }
    return lastId;
  }

  // Resize the textarea
  resizeTextarea() {
    const textareas = document.querySelectorAll('textarea');

    // For each textarea
    textareas.forEach(textarea => {
      // Resize the textarea when the user types in it
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      });
    });
  }


  /* Event listeners */

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

  // Function with an event listener to show the delete modal
  showDeleteModal() {
    // Get the modal overlay and the delete buttons
    const modalOverlay = document.querySelector('section.modal-overlay');
    const deleteCommentButtons = document.querySelectorAll('div.action button.delete');
    // For each delete button
    deleteCommentButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Display the modal overlay with an animation
        modalOverlay.style.display = 'flex';
        modalOverlay.classList.add('active');
        // Event listener to hide the modal
        this.hideDeleteModal(modalOverlay);
        // Event listener to delete the comment or the reply
        this.deleteComment(button, modalOverlay);
      });
    });
  }

  // Function with an event listener to hide the modal when clicking on the cancel button or on the modal overlay
  hideDeleteModal(modalOverlay) {
    // Get the cancel button
    const cancelButton = document.querySelector('.modal-content button.cancel');
    // Close the modal when clicking on the modal overlay
    modalOverlay.addEventListener('click', event => {
      if (event.target === modalOverlay) {
        modalOverlay.style.display = 'none';
      }
    });
    // Close the modal when clicking on the cancel button
    cancelButton.addEventListener('click', () => {
      modalOverlay.style.display = 'none';
    });
  }

  // Function with an event listener to delete a comment or a reply
  deleteComment(deleteButton, modalOverlay) {
    // Get the comment or the reply to delete and the delete button in the modal
    const commentToDelete = deleteButton.closest('.comment, [id^="reply"]');
    const deleteButtonModal = document.querySelector('.modal-content button.delete');
    // Event listener to delete the comment or the reply
    deleteButtonModal.addEventListener('click', () => {
      // Hide the modal, then the comment with an animation and delete it from the DOM after 2 seconds
      modalOverlay.style.display = 'none';
      commentToDelete.classList.add('evaporate');
      setTimeout(() => {
        commentToDelete.remove();
      }, 2000);
    });
  }

  // Function with an event listener to edit a comment or a reply
  editComment() {
    // Get the edit buttons
    const editButtons = document.querySelectorAll('div.action button.edit');
    // For each edit button
    editButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Get the comment or the reply to edit and the content of it
        const commentToEdit = button.closest('.comment, [id^="reply"]');
        const content = commentToEdit.querySelector('p.content');
        // Get the delete button
        const deleteButton = commentToEdit.querySelector('button.delete');
        // Replace the paragraph with a textarea and get it, add an update button
        content.outerHTML = `<textarea class="content" rows="3">${content.innerHTML}</textarea>`;
        const textarea = commentToEdit.querySelector('textarea');
        textarea.insertAdjacentHTML('afterend', '<button class="update">Update</button>');
        // Modify the style of the delete and edit buttons
        button.style.opacity = '0.6';
        deleteButton.style.opacity = '0.6';
        // Inactive the delete and edit buttons
        button.disabled = true;
        deleteButton.disabled = true;

        // Event listener to resize the textarea
        this.resizeTextarea();
        // Event listener to update the comment or the reply
        this.updateComment(commentToEdit, textarea, button, deleteButton);
      });
    });
  }

  // Function with an event listener to update a comment or a reply
  updateComment(commentToEdit, textarea, button, deleteButton) {
    // Get the update button
    const updateButton = commentToEdit.querySelector('button.update');
    // Event listener to update the comment or the reply
    updateButton.addEventListener('click', () => {
      // Replace the textarea with a paragraph and get it, remove the update button
      textarea.outerHTML = `<p class="content">${textarea.value}</p>`;
      const content = commentToEdit.querySelector('p.content');
      updateButton.remove();
      // Modify the style of the delete and edit buttons
      button.style.opacity = '1';
      deleteButton.style.opacity = '1';
      // Active the delete and edit buttons
      button.disabled = false;
      deleteButton.disabled = false;
    });
  }

  // Function to add a reply
  addReply() {
    // Get the reply button
    const replyButtons = document.querySelectorAll('div.action button.reply');
    // For each reply button
    replyButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Get the comment or the reply to reply to
        const commentToReplyTo = button.closest('.comment, [id^="reply"]');
        // Add a reply after the comment and get it
        commentToReplyTo.insertAdjacentHTML('afterend', '<div class="reply-section"></div>');
        const reply = commentToReplyTo.nextElementSibling;
        reply.innerHTML += `
        <img src="${this.checkPicture(this.data.currentUser.image.webp, this.data.currentUser.image.png)}" alt="picture">
        <textarea id="auto-resize-textarea" rows="3"></textarea>
        <button>Reply</button>
        `;
        // Resize the textarea
        this.resizeTextarea();
        // Event listener to display the reply
        this.displayReply(reply, commentToReplyTo);
      });
    });
  }

  // Function with an event listener to display the reply
  displayReply(reply, commentToReplyTo) {
    // Get the reply button
    const replyButton = reply.querySelector('button');
    // Event listener to display the reply
    replyButton.addEventListener('click', () => {
      // Get the content of the reply
      const content = reply.querySelector('textarea').value;
      // Remove the reply section
      reply.remove();
      // Define the reply zone and add the reply
      let replyZone;
      if(commentToReplyTo.closest('.replies') === null) {
        commentToReplyTo.closest('.comment').insertAdjacentHTML('afterend', '<div class="replies"></div>');
        replyZone = commentToReplyTo.closest('.comment').nextElementSibling;
      } else {
        replyZone = commentToReplyTo.closest('.replies');
      }
      replyZone.innerHTML += `
      <div id="reply${this.getLastId(this.data) + 1}">
        <div class="likes">
        <img src="./images/icon-plus.svg" id="like" alt="Plus icon">
        <p class="nb-likes">0</p>
        <img src="./images/icon-minus.svg" id="dislike" alt="Minus icon">
      </div>
      <div class="comment-content">
        <div class="post-info">
          <div class="left">
            <img src="${this.checkPicture(this.data.currentUser.image.webp, this.data.currentUser.image.png)}" alt="picture">
            <p class="profile-name">${this.data.currentUser.username}</p>
            <p class="current-user">you</p>
            <p class="post-date">${new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div class="action">
            <button class="delete"><img src="images/icon-delete.svg" alt="delete">Delete</button>
            <button class="edit"><img src="images/icon-edit.svg" alt="edit">Edit</button>
          </div>
        </div>
        <p class="content">${content}</p>
      </div>
      `;
    });
  }
}

const loader = new JSONLoader('data.json');
loader.loadJSON();