# How to use this birthday site

Everything lives in one folder. Keep the folder together — the pages, photos and song
all reference each other by folder name.

```
birthday-card/
├── index.html      ← the page itself (all 7 screens)
├── style.css       ← all the design
├── script.js       ← all the behaviour + the letter text
├── images/         ← photo1.jpg … photo5.jpg
└── audio/          ← song.mp3
```

## 1. Run it

Double-click `index.html`. It opens in Chrome and works — no server, no install.

One Chrome quirk: with a file opened this way, music only starts *after* a click,
which is exactly what the "Start our story" button is for.

## 2. Add his photos

Put five pictures in the `images` folder named `photo1.jpg` … `photo5.jpg`,
replacing the placeholders. Portrait shots look best. `images/README.txt` says
which photo appears on which screen.

## 3. Add the music

Rename your song to `song.mp3` and drop it in the `audio` folder.
If there's no song there, the site still runs — the music button just stays hidden.

## 4. Change the letter

Open `script.js`. The very first thing in the file is `LETTER_TEXT`.
Write whatever you want between the backticks (`` ` ``). Leave a blank line
between paragraphs. Don't delete the backticks at the start and the end.

## 5. Change the birthday messages

Open `index.html` and look for the comment lines that say `EDIT ME`.
There's one on every screen — the opening title and subtitle, the closing
message, the captions. Change the words between the tags, nothing else.

## 6. Change the questions and answers

Also in `index.html`:

- **Question 1** (screen 2): edit the `<h2 class="question">` text. To change the
  two buttons, edit both the visible text *and* the `data-q1="…"` value (that's
  what gets saved), plus `data-reply="…"` for the little response line.
- **Favourite thing** (screen 3): each answer is one `<button class="chip">`.
  Edit its text and its `data-q2="…"` to match. You can delete one or add more —
  just copy a whole line.
- **The wish** (screen 4) and **the last question** (screen 6): same pattern,
  with `data-q4="…"` on the final buttons.

If you rename a question, also update the labels in `script.js` under
`RECAP_LABELS` and in `buildTxt()` so the saved file reads correctly.

## 7. Change colours and fonts

Open `style.css`. The first block, `:root`, holds every colour and font:

```css
--night: #170A1E;   /* darkest background */
--gold:  #E9C27E;   /* buttons, titles */
--blush: #F3A8BC;   /* hearts and glow */
```

Change a hex value there and it updates everywhere. Fonts work the same way:
`--font-display` (headings), `--font-body` (normal text), `--font-hand`
(the letter and handwritten bits). If you swap in a new Google Font, also
update the `<link>` at the top of `index.html`. Offline, the fallback fonts
listed after each name take over automatically.

## 8. How saving his answers works

His four answers are kept in the browser as he goes (so going back a screen —
or even refreshing — doesn't lose them). On the last screen:

- **Save our answers 💌** downloads `birthday_responses.txt`
- **Save as JSON** downloads `birthday_responses.json`

Both are built in the browser with a Blob and downloaded straight to his
Downloads folder. No server, no internet needed. If he opens it on his phone,
the file lands in the phone's downloads.

To wipe old answers and start clean, open the page, press F12 → Console, and run:
`localStorage.clear()` — then refresh.

## 9. Sending it to him

Zip the whole `birthday-card` folder and send it, or drop the folder onto a free
host (Netlify Drop, GitHub Pages, Vercel) and send the link. Whatever you do,
send the folder, not just `index.html`.
