// DOM Elements
const factBox = document.getElementById('fact-box');
const interestingBtn = document.getElementById('interesting-btn');
const uselessBtn = document.getElementById('useless-btn');
const factHistoryList = document.getElementById('fact-history-list');
const commentsSection = document.getElementById('comments-section');

// Fact history array to store the last 5 facts
let factHistory = [];

// Initialize votes from localStorage if they exist
let interestingVotes = localStorage.getItem('interestingVotes') ? parseInt(localStorage.getItem('interestingVotes')) : 0;
let uselessVotes = localStorage.getItem('uselessVotes') ? parseInt(localStorage.getItem('uselessVotes')) : 0;

// Function to fetch a random fact from the API
async function fetchRandomFact() {
  try {
    // Disable the buttons while the fact is being fetched
    interestingBtn.disabled = true;
    uselessBtn.disabled = true;

    // Show loading spinner
    factBox.innerHTML = `<div class="loading-spinner"></div>`;

    // Fetch random fact from API
    const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');

    // Check if the response is ok, otherwise throw an error
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    // Display the fetched fact in the fact box
    factBox.innerText = data.text;

    // Update fact history with the new fact
    updateFactHistory(data.text);

    // Display comments for this fact
    displayComments(data.text);

  } catch (error) {
    // Display error message in case of an error
    factBox.innerText = "Oops! Something went wrong. Please try again.";
    console.error("Error fetching the fact:", error);
  } finally {
    // Re-enable buttons after the fact is fetched
    interestingBtn.disabled = false;
    uselessBtn.disabled = false;
  }
}

// Function to update fact history and display last 5 facts
function updateFactHistory(fact) {
  factHistory.push(fact);
  if (factHistory.length > 5) {
    factHistory.shift(); // Remove the oldest fact to maintain only the last 5 facts
  }

  factHistoryList.innerHTML = ''; // Clear the existing list

  factHistory.forEach(f => {
    const li = document.createElement('li');
    li.textContent = f;
    factHistoryList.appendChild(li);
  });
}

// Event listener to fetch a fact when the fact box is clicked
factBox.addEventListener('click', () => {
  fetchRandomFact(); // Fetch a new fact when clicked
});

// Event Listeners for voting
interestingBtn.addEventListener('click', () => {
  interestingVotes++;
  localStorage.setItem('interestingVotes', interestingVotes);
  updateChart();
});

uselessBtn.addEventListener('click', () => {
  uselessVotes++;
  localStorage.setItem('uselessVotes', uselessVotes);
  updateChart();
});

// Chart.js Vote Chart Setup
const ctx = document.getElementById('voteChart').getContext('2d');
const voteChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Interesting', 'Useless'],
    datasets: [{
      label: 'Votes',
      data: [interestingVotes, uselessVotes],
      backgroundColor: ['#7289DA', '#F04747'],
      borderColor: ['#7289DA', '#F04747'],
      borderWidth: 1
    }]
  },
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
});

// Function to update the chart with new votes
function updateChart() {
  voteChart.data.datasets[0].data = [interestingVotes, uselessVotes];
  voteChart.update();
}

// Dark Mode Toggle
const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Comments Section
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');

commentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newComment = commentInput.value.trim();
  if (newComment) {
    const fact = factBox.innerText; // Get current fact
    addComment(fact, newComment); // Add comment to this fact
    commentInput.value = ''; // Clear the input after submitting
  }
});

// Function to add a comment to the fact
function addComment(fact, commentText) {
  let comments = JSON.parse(localStorage.getItem('comments')) || {};
  if (!comments[fact]) {
    comments[fact] = [];
  }
  comments[fact].push({ text: commentText, upvotes: 0, downvotes: 0 });
  localStorage.setItem('comments', JSON.stringify(comments));
  displayComments(fact);
}

// Function to display comments for a given fact
function displayComments(fact) {
  const comments = JSON.parse(localStorage.getItem('comments')) || {};
  commentsSection.innerHTML = ''; // Clear previous comments
  if (comments[fact]) {
    comments[fact].forEach((comment, index) => {
      const commentDiv = document.createElement('div');
      commentDiv.classList.add('comment');
      commentDiv.innerHTML = `
        <p>${comment.text}</p>
        <div class="comment-votes">
          <button onclick="voteComment('${fact}', ${index}, 'upvote')">Upvote (${comment.upvotes})</button>
          <button onclick="voteComment('${fact}', ${index}, 'downvote')">Downvote (${comment.downvotes})</button>
        </div>
      `;
      commentsSection.appendChild(commentDiv);
    });
  }
}

// Function to handle comment voting
function voteComment(fact, index, voteType) {
  let comments = JSON.parse(localStorage.getItem('comments')) || {};
  if (comments[fact]) {
    if (voteType === 'upvote') {
      comments[fact][index].upvotes++;
    } else if (voteType === 'downvote') {
      comments[fact][index].downvotes++;
    }
    localStorage.setItem('comments', JSON.stringify(comments));
    displayComments(fact); // Refresh comments after voting
  }
}

// Settings Form for customization
const settingsForm = document.getElementById('settings-form');
settingsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const fontSize = document.getElementById('font-size-input').value;
  const fontStyle = document.getElementById('font-style-input').value;
  const bgColor = document.getElementById('bg-color-input').value;
  
  if (fontSize) {
    factBox.style.fontSize = `${fontSize}px`;
  }
  
  if (fontStyle) {
    factBox.style.fontFamily = fontStyle;
  }
  
  if (bgColor) {
    factBox.style.backgroundColor = bgColor;
  }
});
