/* Kid-friendly, 1–2 sentences.
   Collapsed while encoding (new / practicing).
   Open automatically once solid or shining — kids should not have to hunt for it.
   Never on Walk / Test question prompts. */
var PRESIDENT_FACTS = {
  1: "Led the army in the Revolution and helped the new country start. People asked him to be the first president.",
  2: "A lawyer from Massachusetts who helped argue for independence. He was the first president to live in the White House.",
  3: "Wrote the Declaration of Independence and later bought a huge piece of land called the Louisiana Purchase.",
  4: "Called the Father of the Constitution. He helped write the rules the country still uses.",
  5: "Famous for the Monroe Doctrine, which told other countries not to start new colonies in the Americas.",
  6: "Son of John Adams. He was a skilled diplomat and later fought against slavery in Congress.",
  7: "A tough general known as Old Hickory. He expanded voting for more white men and forced Native nations from their lands.",
  8: "The first president born after the United States became a country. He faced a big money panic while in office.",
  9: "Won fame as a general. He caught a cold after a long speech and died after only one month as president.",
  10: "Took over when Harrison died. He was the first vice president to become president that way.",
  11: "Led the country during the Mexican-American War, which added a lot of land in the West.",
  12: "A general in the Mexican-American War. He died after a short time in office.",
  13: "Opened trade with Japan and worked on a compromise meant to calm fights over slavery.",
  14: "Tried to keep North and South from splitting, but tensions over slavery kept growing.",
  15: "The only president from Pennsylvania. The country was close to civil war when he left office.",
  16: "Led the Union through the Civil War and worked to end slavery. He is remembered for the Gettysburg Address.",
  17: "Took over after Lincoln was killed. He clashed with Congress over how to rebuild the South.",
  18: "A top Union general in the Civil War. As president he tried to protect the rights of newly freed people.",
  19: "Ended the last federal troops in the South after a disputed election. He also tried to reform government jobs.",
  20: "A scholar and Civil War general. He was shot months after taking office and later died from the wound.",
  21: "Became president after Garfield died. He helped pass a law so government jobs were based on skill, not favors.",
  22: "The only president so far with two terms that were not back-to-back. He worked on fair business rules.",
  23: "Grandson of William Henry Harrison. New states joined the Union while he was president.",
  24: "Returned for a second, separate term. He faced hard economic times and labor strikes.",
  25: "Led during a boom in industry and the Spanish-American War. He was later shot in Buffalo.",
  26: "Young and energetic. He protected wild places, built the Panama Canal path, and checked big companies.",
  27: "Later became Chief Justice of the Supreme Court — the only president to do both jobs.",
  28: "A college president who led the country in World War I and pushed for a League of Nations afterward.",
  29: "Promised a return to normal times after the war. His term was later clouded by scandals among some helpers.",
  30: "Nicknamed Silent Cal. The 1920s economy grew quickly while he kept government small.",
  31: "An engineer who had helped feed hungry people after World War I. The Great Depression began on his watch.",
  32: "Led through the Great Depression and most of World War II. He was elected four times — more than anyone else.",
  33: "Made the hard choice to use atomic bombs to end the war with Japan and helped start the United Nations.",
  34: "Supreme Allied commander in Europe in World War II. As president he kept the peace and began the interstate highways.",
  35: "The youngest person elected president. He challenged America to reach the Moon and handled the Cuban Missile Crisis.",
  36: "Pushed major civil rights laws and programs meant to fight poverty. The Vietnam War grew during his term.",
  37: "Opened talks with China, then resigned after the Watergate scandal — the only president to resign.",
  38: "Became president after Nixon left. He is remembered for saying “Our long national nightmare is over.”",
  39: "A peanut farmer and former governor. He helped Egypt and Israel reach a peace agreement at Camp David.",
  40: "A former actor. He talked about freedom, faced the late Cold War, and the economy grew in the 1980s.",
  41: "A pilot in World War II and later vice president. He led a short war to free Kuwait after Iraq invaded.",
  42: "Presided over a strong 1990s economy and worked on peace efforts in several parts of the world.",
  43: "Led after the September 11 attacks and began wars in Afghanistan and Iraq.",
  44: "The first Black president. He passed a major health-care law and ordered the raid that found Osama bin Laden.",
  45: "A businessman and TV star before office. He appointed many judges and negotiated new trade deals.",
  46: "A longtime senator and former vice president. He focused on recovering from the pandemic and new infrastructure.",
  47: "Returned for a second, non-consecutive term — only the second president in U.S. history to do that."
};

function factFor(p){
  if (!p) return "";
  return PRESIDENT_FACTS[p.n] || "";
}
function isRecallSolid(p){
  try {
    var st = (typeof getActiveProgress==="function" && getActiveProgress()[p.n]) || {};
    return (st.state || 0) >= 2;
  } catch (e) { return false; }
}
function factBlock(p, forceOpen){
  var f = factFor(p);
  if (!f) return "";
  // Open when forced (Test success) or when the door is solid / shining
  var open = !!forceOpen || isRecallSolid(p);
  if (open) {
    return '<div class="history-box open"><div class="history-kicker">A bit of history</div><p>'+f+'</p></div>';
  }
  // Still encoding — available, but not in the way
  return '<details class="history-peek"><summary>A bit of history</summary><p>'+f+'</p></details>';
}
