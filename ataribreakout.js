document.getElementById('startButton').addEventListener('click', () => {
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('flashcardScreen').style.display = 'block';
  });
  
  document.getElementById('submitWords').addEventListener('click', async () => {
    const words = document.getElementById('wordInput').value.trim().split('\n');
    if (words.length === 0) {
      alert('Please enter some words!');
      return;
    }
  
    // Get definitions for each word from the LLM
    for (let word of words) {
      const definition = await getDefinition(word.trim());
      if (definition) {
        startGame(word, definition);
      }
    }
  });
  
  async function getDefinition(word) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_API_KEY`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: `Provide a concise definition for the word "${word}".` }]
        })
      });
      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching definition:', error);
      return null;
    }
  }
  
  function startGame(word, definition) {
    document.getElementById('flashcardScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'block';
    document.getElementById('definition').innerText = `Definition: ${definition}`;
  
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
  
    // Game Variables
    let blocks = word.split('').map((letter, index) => ({
      x: 50 + index * 70,
      y: canvas.height - 40,
      width: 50,
      height: 20,
      letter: letter,
      hit: false
    }));
    drawBlocks(ctx, blocks);

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
  
      blocks.forEach(block => {
        if (
          x >= block.x && x <= block.x + block.width &&
          y >= block.y && y <= block.y + block.height &&
          !block.hit
        ) {
          block.hit = true;
          ctx.clearRect(block.x, block.y, block.width, block.height);
          if (block.letter === word[word.length - 1]) {
            alert(`You hit the correct block with letter: ${block.letter}`);
            askLLMQuestion(word);
          }
        }
      });
    });
  }
  
  function drawBlocks(ctx, blocks) {
    blocks.forEach(block => {
      ctx.fillStyle = block.hit ? 'gray' : 'blue';
      ctx.fillRect(block.x, block.y, block.width, block.height);
      ctx.fillStyle = 'white';
      ctx.fillText(block.letter, block.x + block.width / 2 - 5, block.y + block.height / 2 + 5);
    });
  }
  
  async function askLLMQuestion(word) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR API KEY`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: `Create a quiz question using the word "${word}".` }]
        })
      });
      const data = await response.json();
      const question = data.choices[0].message.content;
      alert(`LLM Question: ${question}`);
    } catch (error) {
      console.error('Error fetching LLM question:', error);
    }
  }
