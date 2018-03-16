VAR unhelpful = false
VAR started = false
VAR found = false

- Could you help me?
* Not right now -> ohOkIUnderstand
* {not unhelpful} OK -> itMightSeemSilly
* {found} Actually... -> youFoundHim

=youFoundHim
- You found him!! THANSK!!!
-> DONE

=itMightSeemSilly
- It might seem... silly.  I saw a cat here the other day, and now it's gone.
~ started = true
* That's too bad. -> ohOkIUnderstand
* Would you like me to look for it? -> wouldYouICantLea
-> DONE

=ohOkIUnderstand
- Oh ok, I understand.
~ unhelpful = true
-> DONE

=wouldYouICantLea
-Would you?!  I can't leave, and I am worried.
* Cats can look after themselves. -> ohOkIUnderstand
* I understand. Don't worry. -> thankYou
-> DONE

=thankYou
-Thank you!
-> DONE

-> END