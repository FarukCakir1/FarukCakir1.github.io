const image = document.getElementById("image");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const uniqueHexColors = {};
      
      // rgb to hex
      function rgbToHex(r, g, b) {
        const toHex = (c) => {
          const hex = c.toString(16);
          return hex.length === 1 ? "0" + hex : hex;
        };

        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
      }

      function differenceBetweenTwoColor(color1, color2) {
        var lab1 = color1.lab();
        var lab2 = color2.lab();
        var deltaL = lab1[0] - lab2[0];
        var deltaA = lab1[1] - lab2[1];
        var deltaB = lab1[2] - lab2[2];

        var colorDifference = Math.sqrt(deltaL ** 2 + deltaA ** 2 + deltaB ** 2);
        // var diffRGB = color1.rgb().map(function(c, i) {
        //   return Math.abs(c - color2.rgb()[i]);
        // });
        return colorDifference;
      }

      function hexToRgb(hex) {
        // Hex kodunu # ile başlıyorsa kaldır
        let cleanHex = hex.replace("#", "");
      
        let r = parseInt(cleanHex.substring(0, 2), 16);
        let g = parseInt(cleanHex.substring(2, 4), 16);
        let b = parseInt(cleanHex.substring(4, 6), 16);
      
        return {r, g, b};
    }
    
      // catch similiar colors
    function hexColorDelta(hex1, hex2) {
      let rgb1 = hexToRgb(hex1);
      let rgb2 = hexToRgb(hex2);
  
      // RGB değerleri arasındaki farkın karesini al
      let rDiff = (rgb1.r - rgb2.r) ** 2;
      let gDiff = (rgb1.g - rgb2.g) ** 2;
      let bDiff = (rgb1.b - rgb2.b) ** 2;
  
      // Euclidean uzaklık formülünü kullan
      let distance = Math.sqrt(rDiff + gDiff + bDiff);
  
      // Daha küçük değerler daha benzer renkler anlamına gelir
      return distance;
    }
    
      image.onload = function () {
        console.log(differenceBetweenTwoColor(chroma('rgb(91, 72, 42)'), chroma('rgb(110, 88, 53)')));
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0, image.width, image.height);
        const wrapper = document.createElement('div');
        wrapper.classList.add('frame')
        wrapper.style.width = `${image.width}px`;
        document.body.appendChild(wrapper);
        let xPos = 1;
        let yPos = 1;
        for (let y = 0; y < image.height; y += (image.height / 100)) {
          for (let x = 0; x < image.width; x+= (image.width / 58)) {
            const pixel = context.getImageData(x, y, 1, 1, {
              willReadFrequently: true,
            }).data;
            const hexColor = rgbToHex(pixel[0], pixel[1], pixel[2]);
            let isDeltaOK = true;
            Object.keys(uniqueHexColors).forEach(uniqueCode => {
              const delta = differenceBetweenTwoColor(chroma(`rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`), chroma(uniqueCode))
              if(delta < 5) {
                isDeltaOK = false
                return
              }
            })
            if (!uniqueHexColors.hasOwnProperty(hexColor) && isDeltaOK) {
              uniqueHexColors[`rgb(${pixel[0]}, ${(pixel[1])}, ${pixel[2]})`] = "";
            }
            const singlePix = document.createElement('span')
            singlePix.classList.add('singlePix')
            singlePix.style.width = `${(image.width / 58)}px`
            singlePix.style.height = `${(image.height / 100)}px`
            singlePix.style.backgroundColor = hexColor;
            singlePix.setAttribute('xPos',xPos)
            singlePix.setAttribute('yPos', yPos)
            singlePix.addEventListener('click', (e) => {
              const wrapper = document.querySelector('.customizeWrapper')
              wrapper.style.display = 'flex';
              const inp = document.querySelector('.newValueInp');
              let newVal = '';
              inp.addEventListener('input', (evt) => {
                newVal = evt.target.value;
              })
              const done = document.querySelector('.doneBtn')
              done.addEventListener('click', () => {
                e.target.innerHTML = newVal;
                wrapper.style.display = 'none';
              })
            })
            wrapper.appendChild(singlePix)
            xPos++;
          }
          xPos = 1;
          yPos++;
        }
        let hexCodeArray = Object.keys(uniqueHexColors)
        console.log(hexCodeArray);
        let spliceStartValue = 0;
        let deltaValueComparer = 10;
        while (hexCodeArray.length > 13) {
          spliceStartValue = 0;
          deltaValueComparer  += 2;
          for (let i = 0; i < hexCodeArray.length; i++) {
            let spliceEndValue = i === 0 ? i +1 : i;
            const deltaValue = differenceBetweenTwoColor(chroma(hexCodeArray[spliceStartValue]), chroma(hexCodeArray[spliceEndValue]))
            if(deltaValue < deltaValueComparer) {
              delete uniqueHexColors[hexCodeArray[i]]
              hexCodeArray = Object.keys(uniqueHexColors);
            } else {
              spliceStartValue = i
            }
          }
        }
        
            
            // deltaValueComparer += 1;
            
            console.log(hexCodeArray);
        // console.log(Object.keys(uniqueHexColors).length);
       const colorBoxWrapper = document.querySelector('.colorBoxesWrapper')
       const inputsWrapper = document.querySelector('.input-wrapper')
       for (let i = 0; i < hexCodeArray.length; i++) {
        const colorBox = document.createElement('div')
        colorBox.classList.add('colorBox')
        colorBox.style.display = 'flex'
        colorBox.style.backgroundColor = hexCodeArray[i];
        colorBoxWrapper.appendChild(colorBox);
        const assignInput = document.createElement('input');
        assignInput.id = hexCodeArray[i];
        assignInput.classList.add('assignInput');
        inputsWrapper.appendChild(assignInput);
        assignInput.addEventListener('input', (e) => {
          uniqueHexColors[hexCodeArray[i]] = e.target.value;
        })
       }
       const btn = document.querySelector('.assignBtn');
       const modal = document.querySelector('.assigModalWrapper')
       const colorBoxes = document.querySelectorAll('.singlePix');
       btn.addEventListener('click', () => {
        modal.style.display = 'none';
        colorBoxes.forEach(box => {
          const rgbColor = getComputedStyle(box).backgroundColor
          for (let i = 0; i < Object.keys(uniqueHexColors).length; i++) {
            const deltaValue = differenceBetweenTwoColor(chroma(`${rgbColor}`), chroma(Object.keys(uniqueHexColors)[i]))
            if (deltaValue < 17) {
              box.innerHTML = uniqueHexColors[Object.keys(uniqueHexColors)[i]]
            }
          }
        })
       })
       let row = 1
       let column = 1;
       const selectRowBtn = document.querySelector('.selectRow');
       const input = document.querySelector('.rowSelectInput');
       input.addEventListener('input', (e) => {row = e.target.value; column = 1})
       selectRowBtn.addEventListener('click', () => {
        const donebtn = document.querySelector('.done');
        const wrapper = document.querySelector('.selectRowWrapper');
        const inputWrapper = document.querySelector('.inputWrapper');
        
        console.log(getComputedStyle(inputWrapper).display);
        
          inputWrapper.style.display = 'flex';
        
        wrapper.style.display = 'flex';
        donebtn.addEventListener('click', () => {
          inputWrapper.style.display = 'none';
          colorBoxes.forEach(box => {
            box.style.zIndex = '0';
            if(box.getAttribute('ypos') == row) {
              box.style.zIndex = '99999'
            }
          })
        })
       })
       document.body.onkeyup = function(e) {
        const selectedRow = document.querySelectorAll(`[ypos="${row}"]`)
        if (e.key == " " ||
            e.code == "Enter"     
        ) {
          selectedRow.forEach(box => {
            if(box.getAttribute('xpos') == column) {
              box.innerHTML = 'Boyandı'
            }
          })
          column++;
        }
      }
      };
      image.src = "example.jpg";