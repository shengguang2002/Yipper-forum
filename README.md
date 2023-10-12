# Yipper

## Overview
'Yipper' is inspired by the website 'Twitter' but this site is exclusively for dogs (the superior household pet and companion). You will not need an understanding of how Twitter works in order to successfully complete this assignment.

### Yipper Context
In order to understand the specification below, we will describe the structure of a "yip" for the Yipper site. A "yip" is like a "tweet" (on Twitter). The Yipper site will have some defined requirements for what format a full "yip" can take. A yip is made up of some text/characters/spaces, a single space, a pound/hashtag (`#`) followed by a the hashtag text. Examples of valid yips are shown below (not exhaustive):
```
example of a Yip #first
```
```
this. is. great. #second
```
```
???!!!!!!!????? #third
```
```
wOw aLterNating CAPS #fouRTh
```
```
letters and numbers #5th
```
```
dkh?.!!! dhjaksf   hfjahjfiuyiore #66666666666666
```
A full and detailed explanation of the allowed characters and format for a Yip is described below:
  * The text of a Yip can be made up of any combination of any word character (letter, number, underscore), any whitespace character, a period (`.`), an exclamation point (`!`) and/or a question mark (`?`). At _minimum_ the Yip text should be a single one of the characters mentioned above but there is no restriction on how long the text of a Yip can be.
  * The text of a Yip should be separated by a single whitespace character and then a pound sign (`#`).
  * Following the pound sign (`#`) is the hashtag which is is any combination of one or more of lowercase letters, capital letters and/or numbers.