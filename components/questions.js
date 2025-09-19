// ANXIETY (GAD-7, 7 questions)
const anxietyQuestions = [
    { id: 1, text: "Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?" },
    { id: 2, text: "Over the last 2 weeks, how often have you not been able to stop or control worrying?" },
    { id: 3, text: "Over the last 2 weeks, how often have you worried too much about different things?" },
    { id: 4, text: "Over the last 2 weeks, how often have you had trouble relaxing?" },
    { id: 5, text: "Over the last 2 weeks, how often have you been so restless that it's hard to sit still?" },
    { id: 6, text: "Over the last 2 weeks, how often have you become easily annoyed or irritable?" },
    { id: 7, text: "Over the last 2 weeks, how often have you felt afraid as if something awful might happen?" }
  ];
  
  // STRESS (PSS-10, 10 questions)
  const stressQuestions = [
    { id: 1, text: "In the last month, how often have you been upset because of something that happened unexpectedly?" },
    { id: 2, text: "In the last month, how often have you felt unable to control the important things in your life?" },
    { id: 3, text: "In the last month, how often have you felt nervous and stressed?" },
    { id: 4, text: "In the last month, how often have you felt confident about your ability to handle your personal problems?" },
    { id: 5, text: "In the last month, how often have you felt that things were going your way?" },
    { id: 6, text: "In the last month, how often have you found that you could not cope with all the things you had to do?" },
    { id: 7, text: "In the last month, how often have you been able to control irritations in your life?" },
    { id: 8, text: "In the last month, how often have you felt that you were on top of things?" },
    { id: 9, text: "In the last month, how often have you been angered because of things that were outside of your control?" },
    { id: 10, text: "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?" }
  ];
  
  // ANGER (Clinical Anger Scale, 21 questions)
  const angerQuestions = [
    { id: 1, text: "I feel angry." },
    { id: 2, text: "I feel like hitting someone." },
    { id: 3, text: "I get irritated easily." },
    { id: 4, text: "I have trouble controlling my temper." },
    { id: 5, text: "I feel like yelling or screaming." },
    { id: 6, text: "I feel frustrated." },
    { id: 7, text: "I feel like breaking things." },
    { id: 8, text: "I feel tense or on edge." },
    { id: 9, text: "I get into arguments." },
    { id: 10, text: "I feel like taking my anger out on someone." },
    { id: 11, text: "I feel like throwing or hitting objects." },
    { id: 12, text: "I feel like hurting someone." },
    { id: 13, text: "I feel like shouting at people." },
    { id: 14, text: "I feel like slamming doors." },
    { id: 15, text: "I feel like breaking or damaging things." },
    { id: 16, text: "I feel like losing control." },
    { id: 17, text: "I feel like expressing my anger physically." },
    { id: 18, text: "I feel like yelling at people." },
    { id: 19, text: "I feel like hitting or hurting someone." },
    { id: 20, text: "I feel like acting out my anger." },
    { id: 21, text: "I feel like exploding with anger." }
  ];
  
  // LOW ENERGY (Zung Self-Rating Depression Scale, 20 questions)
  const lowQuestions = [
    { id: 1, text: "I feel down-hearted and blue." },
    { id: 2, text: "Morning is when I feel the best." },
    { id: 3, text: "I have crying spells or feel like it." },
    { id: 4, text: "I have trouble sleeping at night." },
    { id: 5, text: "I eat as much as I used to." },
    { id: 6, text: "I still enjoy sex." },
    { id: 7, text: "I notice that I am losing weight." },
    { id: 8, text: "I have trouble with constipation." },
    { id: 9, text: "My heart beats faster than usual." },
    { id: 10, text: "I get tired for no reason." },
    { id: 11, text: "My mind is as clear as it used to be." },
    { id: 12, text: "I find it easy to do the things I used to." },
    { id: 13, text: "I am restless and can't keep still." },
    { id: 14, text: "I feel hopeful about the future." },
    { id: 15, text: "I am more irritable than usual." },
    { id: 16, text: "I find it easy to make decisions." },
    { id: 17, text: "I feel that I am useful and needed." },
    { id: 18, text: "My life is pretty full." },
    { id: 19, text: "I feel that others would be better off if I were dead." },
    { id: 20, text: "I still enjoy the things I used to do." }
  ];
  
  // SAD/DEPRESSED (PHQ-9, 9 questions)
  const sadQuestions = [
    { id: 1, text: "Little interest or pleasure in doing things?" },
    { id: 2, text: "Feeling down, depressed, or hopeless?" },
    { id: 3, text: "Trouble falling or staying asleep, or sleeping too much?" },
    { id: 4, text: "Feeling tired or having little energy?" },
    { id: 5, text: "Poor appetite or overeating?" },
    { id: 6, text: "Feeling bad about yourself, or that you are a failure or have let yourself or your family down?" },
    { id: 7, text: "Trouble concentrating on things, such as reading or watching TV?" },
    { id: 8, text: "Moving or speaking so slowly that other people could have noticed? Or the opposite—being so fidgety or restless that you have been moving around a lot more than usual?" },
    { id: 9, text: "Thoughts that you would be better off dead, or of hurting yourself in some way?" }
  ];

  const happyQuestions = [
    { id: 1, text: "Little interest or pleasure in doing things?" },
  ];
  
  export default function getQuestionsByMood(mood) {
    switch (mood) {
      case "anxiety":
        return anxietyQuestions;
      case "stress":
        return stressQuestions;
      case "anger":
        return angerQuestions;
      case "low":
        return lowQuestions;
      case "sad":
        return sadQuestions;
      case "happy":
        return happyQuestions;
      default:
        return [];
    }
  }
  