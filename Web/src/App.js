// import React from 'react';

// function Header() {
//   return <header>
//     <h1><a href='/'>WEB</a></h1>
//   </header>
// }


// function App() {
//   const [qrData, setQrData] = useState(""); 
//   const [remainingTime, setRemainingTime] = useState(5); // QR 코드 유효 시간 설정 (초)
//   const qrTime = 1; // QR 코드 재생성 간격 (초)

//   useEffect(() => {
//     const generateQRDataWithTimestamp = () => {
//       const prefix = "myApp_";
//       const now = new Date();
//       const timestamp = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
//       return prefix + timestamp;
//     };

//     const updateQRCode = () => {
//       setQrData(generateQRDataWithTimestamp());
//       setRemainingTime(qrTime); // 남은 시간 재설정
//     };

//     updateQRCode(); // 초기 QR 코드 생성

//     const interval = setInterval(updateQRCode, qrTime * 1000); // 주기적으로 QR 코드 갱신

//     const countdown = setInterval(() => {
//       setRemainingTime(prevTime => prevTime > 0 ? prevTime - 1 : 0); // 남은 시간 감소
//     }, 1000);

//     // 컴포넌트 언마운트 시 interval과 countdown 정리
//     return () => {
//       clearInterval(interval);
//       clearInterval(countdown);
//     };
//   }, []);

//   useEffect(() => {
//     // remainingTime이 0이 되면 QR 코드를 비움
//     if (remainingTime === 0) {
//       setQrData("");
//     }
//   }, [remainingTime]);

//   return (
//     <div className="App">
//       <header className="App-header">
//         <h1>출석 체크</h1>
//         <div>
//           <QRCode value={qrData} bgColor={'white'} size={512}/>
//         </div>
//       </header>
//     </div>
//   );
// }

// export default App;

import React from 'react';

function Header() {
  return <header>
    <h1><a href='/'>WEB</a></h1>
  </header>
}


function App() {

  return (
    <div>
      <Header></Header>
      <h1>Main Page</h1>
      <p>This is the test page.</p>
    </div>
  );
}

export default App;
