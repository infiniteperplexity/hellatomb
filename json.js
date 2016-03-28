function walk(holder, key) {
  var k, v, value = holder[key];
  if (value && typeof(value)==="object") {
    for (k in value) {
      if (Object.hasOwnProperty.call(value, k)) {
        v = walk(value, k);
        if (v!==undefined) {
          value[k]=v;
        } else {
          delete value[k];
        }
      }
    }
  }
  return reviver.call(holder, key, value);
}

function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }
