'''

Compress string array:
  array if character or substring that will be replaced


See if substring exists in the current compressed string array
  -first, just see if the substring exists in the compressed string array on its own
  -if not, then go through the array and combine characters/strings until we match or reach the end
-if exists, then add the next character and check again
-if not:
  -if 1 or 2 characters, then store first character
  -else, add previous substring to the compress string array

ABAABAA

A -> substring exists?
  -no, single character -> Store
.B -> substring exists?
  -no, single character -> Store
..A -> substring exists?
  -yes
..AA -> substring exists?
  -no, two chars, so only store previous character
...A -> substring exists?
  -yes
...AB -> substring exists?
  -yes
...ABA -> substring exists?
  -yes
...ABAA -> substring exists?
  -no (unless we include the start character...)
    -more than two characters, so add previous to array and map
      -save start index and size to map
        -single values are size 1, escape is size 2, multiple values are size 4
......A -> end of string, store the character

Then go through the compression array and create byte array
if single value:
  if equal to escale value, store value + 00
  else store value
if multiple values:
  get the size and starting point from the map
  store escape, size, offset to start point

Measure the output size different when including start character or not

'''


#the map to find the escape character
map = [0] * 256
content = []
escape = ''

def readFile(path):
  global map
  global content
  
  with open(path, "rb") as f:
    bytes_read = open("test.bin", "rb").read()
    for b in bytes_read:
      b = int(b)
      map[b] += 1
      content.append(b)
  
def findEscape():
  global map
  
  escape = {
    'byte' : 0,
    'count' : map[0]
  }
  for i in range( len(map) ):
    if map[i] < escape['count']:
      escape['byte'] = i
      escape['count'] = map[i]
      
  return escape['byte']

def compress():
  global escape
  global content
  global out
  # Build the dictionary.
  dict_size = 256
  dictionary = {}
  sizes = {}
  repeat = {}
  w = ""
  result = []
  index = 0
  size = 0
  
  for i in range(dict_size):
    h = hex(i)
    if i == escape:
      dictionary[h] = [i,0]
      sizes[h] = 2
    else:
      dictionary[h] = [i]
      sizes[h] = 1
  
  
  for c in content:
    h = hex(c)
    wc = w + h
    if wc in dictionary:
      w = wc
    else:
      dictionary[wc] = [index]
      if sizes[w] > 1:
        if w in repeat:
          result += [escape]
          result += [3]
          result += [dictionary[w][0]+1]
        else:
          result += [escape]
          result += [sizes[w]]
          result += [dictionary[w][0]]
        index += 3
      else:
        index += 1
        result += dictionary[w]
      # Add wc to the dictionary.
      repeat[w] = True
      sizes[wc] = sizes[w] + 3
      w = h
        
  # Output the code for w.
  if w:
    if sizes[w] > 1:
      if w in repeat:
        result += [escape]
        result += [3]
        result += [dictionary[w][0]+1]
      else:
        result += [escape]
        result += [sizes[w]]
        result += [dictionary[w][0]]
    else:
      result += dictionary[w]
    
  return result
    
readFile("test.bin")
escape = findEscape()
out = [escape]
print(compress())
print(out)