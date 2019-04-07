# Parth Syntax

```
action [(*args)] tag [id] 
[...]
-> tag [id] attr [value] [tag [id]]
[...];
```

## General Syntax

- on first action: create new driver
- on semicolon: destroy driver
- on tag: check if id is tag unless tag is element
- on \n: continue
- on ->: assert statement is true
- on id == none: ignore id, get element by tag
- on \: escape next character

## -> (Assert Statements) Syntax

- on element == document: don't expect id
- on attr == onTopOf || attr == below: 
    - expect value is element id
    - check if element 1 is loaded after/before element 2
- on attr == centered:  **_roll out later_**
    - expect value is "horizontally", "vertically", "horizontally and vertically", or "vertically and horizontally" and element id
    - check if element is properly centered within element


``` 
send_keys ('username') textArea username 
send_keys ('password') textArea password
click button login
-> element header text 'logged in'
click button next
-> element header text 'next page';
-> element header centered "horizontally" body;
send_keys ("username = \'hello "world\"'");
```
