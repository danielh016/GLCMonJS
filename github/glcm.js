function ProcessToGrayImage(){
	var canvas = document.getElementById('myCanvasElt');
	var ctx = canvas.getContext('2d');
	var img = new Image()
	img.src = "VerifyCode.gif"
	ctx.drawImage(img,0,0);
	
	var canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	for (var x = 0; x < canvasData.width; x++) {
	    for (var y = 0; y < canvasData.height; y++) {
	        // Index of the pixel in the array
	        var idx = (x + y * canvas.width) * 4;  //x can't be greater than canvas.width, this is why y must multiply width
	        // The RGB values
	        var r = canvasData.data[idx + 0];    //.getImageData.data[0-3] --> 0: red; 1: green; 2: blue; 3: alpha
	        var g = canvasData.data[idx + 1];
	        var b = canvasData.data[idx + 2];
	        // Update the values of the pixel;
	        var gray = CalculateGrayValue(r , g , b);
			
	        canvasData.data[idx + 0] = gray;
	        canvasData.data[idx + 1] = gray;
	        canvasData.data[idx + 2] = gray;
	    }
	}
	ctx.putImageData(canvasData, 0, 0);
}

//計算圖像的灰度值,公式為：Gray = R*0.299 + G*0.587 + B*0.114
 function CalculateGrayValue(rValue,gValue,bValue){
 	  	   return parseInt(rValue * 0.299 + gValue * 0.587 + bValue * 0.114);
 	}	
 //一維OTSU圖像處理算法
 function OTSUAlgorithm(){
   var m_pFstdHistogram = new Array();//表示灰度值的分佈點概率
   var m_pFGrayAccu = new Array();//其中每一個值等於m_pFstd Histogram中從0到當前下標值的和
   var m_pFGrayAve = new Array();//其中每一值等於m_pFstd Histogram中從0到當前指定下標值*對應的下標之和
   var m_pAverage=0;//值為m_pFstd Histogram【256】中每一點的分佈概率*當前下標之和
   var m_pHistogram = new Array();//灰度直方圖
   var i,j;
   var temp=0,fMax=0;//定義一個臨時變量和一個最大類間方差的值
   var nThresh = 0;//最優閥值
   //獲取灰度圖像的信息
   var imageInfo = GetGrayImageInfo();
   if(imageInfo == null){
     window.alert("圖像還沒轉換為灰度圖像！");
     return;
   }
   //初始化各項參數
   for(i=0; i<256; i++){
     m_pFstdHistogram[i] = 0;
     m_pFGrayAccu[i] = 0;
     m_pFGrayAve[i] = 0;
     m_pHistogram[i] = 0;
   }
   //獲取圖像信息
   var canvasData = imageInfo[0];
   //獲取圖像的像素
   var pixels = canvasData.data;

   //下面統計圖像的灰度分佈信息
   for(i=0; i<pixels.length; i+=4){
      //獲取r的像素值，因為灰度圖像，r=g=b，所以取第一個即可
      var r = pixels[i];
      m_pHistogram[r]++;
   }
   //下面計算每一個灰度點在圖像中出現的概率
   var size = canvasData.width * canvasData.height;
   for(i=0; i<256; i++){
      m_pFstdHistogram[i] = m_pHistogram[i] / size;
   }
   //下面開始計算m_pFGrayAccu和m_pFGrayAve和m_pAverage的值
   for(i=0; i<256; i++){
      for(j=0; j<=i; j++){
        //計算m_pFGaryAccu[256]
		m_pFGrayAccu[i] += m_pFstdHistogram[j];
		//計算m_pFGrayAve[256]
		m_pFGrayAve[i] += j * m_pFstdHistogram[j];
      }
      //計算平均值
	  m_pAverage += i * m_pFstdHistogram[i];
   }
   //下面開始就算OTSU的值,從0-255個值中分別計算ostu並尋找出最大值作為分割閥值
   for (i = 0 ; i < 256 ; i++){
		temp = (m_pAverage * m_pFGrayAccu[i] - m_pFGrayAve[i]) * (m_pAverage * m_pFGrayAccu[i] - m_pFGrayAve[i]) / (m_pFGrayAccu[i] * (1 - m_pFGrayAccu[i]));
		if (temp > fMax){
			fMax = temp;
			nThresh = i;
		}
	}
	 alert("閥值為:"+nThresh);
   //下面執行二值化過程 
   for(i=0; i<canvasData.width; i++){
      for(j=0; j<canvasData.height; j++){
         //取得每一點的位置
         var ids = (i + j*canvasData.width)*4;
         //取得像素的R分量的值
         var r = canvasData.data[ids];
         //與閥值進行比較，如果小於閥值，那麼將改點置為0，否則置為255
		
         var gray = r>nThresh?255:0;
         canvasData.data[ids+0] = gray;
         canvasData.data[ids+1] = gray;
         canvasData.data[ids+2] = gray;
      }
   }
   //顯示二值化圖像
   var newImage = document.getElementById('myCanvasThreshold').getContext('2d');
   newImage.putImageData(canvasData,0,0);
 }	
 
 //獲取圖像的灰度圖像的信息
 function GetGrayImageInfo(){
    var canvas = document.getElementById('myCanvasElt');
	var ctx = canvas.getContext('2d');
	var canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	if(canvasData.data.length==0){
	  return null;
	}
	return [canvasData,ctx];
 }

  //取得二值化影像
 function GetOstuImageInfo(){
    var canvas = document.getElementById('myCanvasThreshold');
	var ctx = canvas.getContext('2d');
	var canvasData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	if(canvasData.data.length==0){
	  return null;
	}
	return [canvasData,ctx];
 }
  function Algorithm(){
  var imageInfo = GetGrayImageInfo();
  //獲取圖像信息
  var canvasData = imageInfo[0];
  //獲取圖像的像素
  var pixels = canvasData.data;
     
  var entropy = 0,energy = 0,contrast = 0,homogenity = 0,inverse_difference = 0,dissimilarity = 0;  
  var w,k,l,height=250,width=250,GLCM_DIS=3,GLCM_CLASS=16; //計算灰度共生矩陣  
  var  glcm = new Array(GLCM_CLASS*GLCM_CLASS);  //16為計算灰度共生矩陣的圖像灰度值等級化
  var histImage = pixels;

  //初始化共生矩陣  
    for (i = 0;i < 16;i++){
        for (j = 0;j < 16;j++){  
            glcm[i * 16 + j] = 0;
        }
    }
  //灰度等級化---分GLCM_CLASS個等級 
    for(i = 0;i < height;i++){  
        for(j = 0;j < width;j++){  
            histImage[i * width + j] = (histImage[i * width + j]* GLCM_CLASS / 256);  
        }  
    }  
	
  //水平方向
  if(height < width){  
        for (i = 0;i < height;i++){  
            for (j = 0;j < width;j++){  
                l = histImage[i * width + j];  
                if(j + GLCM_DIS >= 0 && j + GLCM_DIS < width){  
                    k = histImage[i * width + j + GLCM_DIS];  
                    glcm[l * GLCM_CLASS + k]++;  
                }  
                if(j - GLCM_DIS >= 0 && j - GLCM_DIS < width){  
                    k = histImage[i * width + j - GLCM_DIS];  
                    glcm[l * GLCM_CLASS + k]++;  
                }  
            }  
        }  
    } 
    else if(height > width){  
        for (i = 0;i < height;i++){  
            for (j = 0;j < width;j++){  
                l = histImage[i * width + j];  
                if(i + GLCM_DIS >= 0 && i + GLCM_DIS < height){  
                    k = histImage[(i + GLCM_DIS) * width + j];  
                    glcm[l * GLCM_CLASS + k]++;  
                }  
                if(i - GLCM_DIS >= 0 && i - GLCM_DIS < height){  
                    k = histImage[(i - GLCM_DIS) * width + j];  
                    glcm[l * GLCM_CLASS + k]++;  
                }  
            }  
        }  
    }  	
	//對角方向  
    else if(height == width){  
        for (i = 0;i < height;i++){  
            for (j = 0;j < width;j++){  
                l = histImage[i * width + j];  
                if(j + GLCM_DIS >= 0 && j + GLCM_DIS < width && i + GLCM_DIS >= 0 && i + GLCM_DIS < height){  
                    k = histImage[(i + GLCM_DIS) * width + j + GLCM_DIS];  
                    glcm[l * GLCM_CLASS + k]++;  
                }  
                if(j - GLCM_DIS >= 0 && j - GLCM_DIS < width && i - GLCM_DIS >= 0 && i - GLCM_DIS < height){  
                    k = histImage[(i - GLCM_DIS) * width + j - GLCM_DIS];  
                    glcm[l * GLCM_CLASS + k]++;  
                }  
            }  
        }  
    }
	 
    //計算特徵值
    for (i = 0;i < GLCM_CLASS;i++){  
        for (j = 0;j < GLCM_CLASS;j++){  
            //熵(ENT)
            var ij = i-j;
            if(glcm[i * GLCM_CLASS + j] > 0)  
            entropy -= glcm[i * GLCM_CLASS + j] * Math.log10((glcm[i * GLCM_CLASS + j]));  
            //能量(UNI)  
            energy += Math.pow(glcm[i * GLCM_CLASS + j],2);  
            //對比度(CON)  
            contrast += Math.pow(ij,2) * glcm[i * GLCM_CLASS + j];  
            //一致性(HOM)  
            homogenity += (glcm[i * GLCM_CLASS + j]) / (1 + Math.pow(ij,2));
            //逆差額(INV，不同於Matlab的CLU群聚傾向度)
            inverse_difference += glcm[i * GLCM_CLASS + j] * Math.abs(ij);
            //不相似度(DIS)
            dissimilarity += (glcm[i * GLCM_CLASS + j]) / (1 + Math.abs(ij));
        }  
    } 

	alert("熵ENT: "+entropy);
	alert("能量UNI: "+energy);
	alert("對比度CON: "+contrast);
	alert("一致性HOM: "+homogenity);
  alert("逆差額INV: "+inverse_difference);
  alert("不相似度DIS: "+dissimilarity);
	}