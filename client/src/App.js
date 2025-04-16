import React, { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';
import StudentCredential from './contracts/StudentCredential.json';

function App() {
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  
  // States for adding institution
  const [institutionAddress, setInstitutionAddress] = useState('');
  const [institutionName, setInstitutionName] = useState('');
  
  // States for issuing certificate
  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  
  // States for verification and revocation
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState(null);
  const [issuedCertificateId, setIssuedCertificateId] = useState('');

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);

        const contractAddress = "0x136f9F7cA844Cbf58bc3eA4E0DCcEace65B7DF96"; // Replace after deployment
        const contractInstance = new ethers.Contract(
          contractAddress,
          StudentCredential.abi,
          signer
        );
        setContract(contractInstance);
      }
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  // Add Institution (Only owner)
  const handleAddInstitution = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.addInstitution(institutionAddress, institutionName);
      await tx.wait();
      alert("Institution added successfully!");
      setInstitutionAddress('');
      setInstitutionName('');
    } catch (error) {
      alert("Error adding institution: " + error.message);
    }
  };

  // Issue Certificate (Only authorized institutions)
  const handleIssueCertificate = async (e) => {
  e.preventDefault();
  try {
    const tx = await contract.issueCertificate(
      studentName,
      courseName,
      "CERTIFICATE_HASH"
    );
    const receipt = await tx.wait();
    
    // Get certificate ID from events
    const event = receipt.events.find(event => event.event === 'CertificateIssued');
    const certificateId = event.args.certificateId;
    
    // Set the certificate ID in state instead of showing alert
    setIssuedCertificateId(certificateId);
    setStudentName('');
    setCourseName('');
  } catch (error) {
    alert("Error issuing certificate: " + error.message);
  }
};

  // Verify Certificate (Public)
  const handleVerifyCertificate = async (e) => {
    e.preventDefault();
    try {
      const result = await contract.verifyCertificate(certificateId);
      setVerificationResult({
        studentName: result[0],
        courseName: result[1],
        issueDate: new Date(Number(result[2]) * 1000).toLocaleDateString(),
        certificateHash: result[3],
        isValid: result[4],
        issuingInstitution: result[5]
      });
    } catch (error) {
      alert("Error verifying certificate: " + error.message);
    }
  };

  // Revoke Certificate (Only issuing institution)
  const handleRevokeCertificate = async (e) => {
    e.preventDefault();
    try {
      const tx = await contract.revokeCertificate(certificateId);
      await tx.wait();
      alert("Certificate revoked successfully!");
      // Refresh verification result if displayed
      if (verificationResult) {
        handleVerifyCertificate(e);
      }
    } catch (error) {
      alert("Error revoking certificate: " + error.message);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Student Credential System</h1>

      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <p>Connected Account: {account}</p>
      )}

      {/* Add Institution Section */}
      <div style={{ marginTop: '20px' }}>
        <h2>Add Institution (Owner Only)</h2>
        <form onSubmit={handleAddInstitution}>
          <div>
            <input
              type="text"
              placeholder="Institution Address"
              value={institutionAddress}
              onChange={(e) => setInstitutionAddress(e.target.value)}
            />
          </div>
          <div>
            <input
              type="text"
              placeholder="Institution Name"
              value={institutionName}
              onChange={(e) => setInstitutionName(e.target.value)}
            />
          </div>
          <button type="submit">Add Institution</button>
        </form>
      </div>

      <div style={{ marginTop: '20px' }}>
  <h2>Issue Certificate (Authorized Institutions Only)</h2>
  <form onSubmit={handleIssueCertificate}>
    <div>
      <input
        type="text"
        placeholder="Student Name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />
    </div>
    <div>
      <input
        type="text"
        placeholder="Course Name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
      />
    </div>
    <button type="submit">Issue Certificate</button>
  </form>
  
  {/* New Certificate ID display section */}
  {issuedCertificateId && (
    <div style={{ 
      marginTop: '20px', 
      padding: '15px', 
      border: '2px solid #ff9800',
      borderRadius: '5px',
      backgroundColor: '#fff3e0' 
    }}>
      <h3 style={{ color: '#e65100' }}>⚠️ Important: Save Your Certificate ID</h3>
      <p style={{ color: '#ff6f00' }}>
        Please store this Certificate ID carefully. It will be required for future verification:
      </p>
      <p style={{ 
        padding: '10px', 
        backgroundColor: '#fff', 
        border: '1px solid #ffd180',
        borderRadius: '3px',
        wordBreak: 'break-all',
        fontFamily: 'monospace',
        fontSize: '14px'
      }}>
        {issuedCertificateId}
      </p>
      <p style={{ color: '#795548', marginTop: '10px', fontSize: '14px' }}>
        Make sure to save this ID in a secure location. Without this ID, you won't be able to verify your certificate.
      </p>
    </div>
  )}
</div>
      {/* Verify/Revoke Certificate Section */}
      <div style={{ marginTop: '20px' }}>
        <h2>Verify/Revoke Certificate</h2>
        <form onSubmit={handleVerifyCertificate}>
          <div>
            <input
              type="text"
              placeholder="Certificate ID"
              value={certificateId}
              onChange={(e) => setCertificateId(e.target.value)}
            />
          </div>
          <button type="submit">Verify Certificate</button>
          <button onClick={handleRevokeCertificate} type="button">Revoke Certificate</button>
        </form>

        {verificationResult && (
          <div style={{ marginTop: '10px' }}>
            <h3>Verification Result:</h3>
            <p>Student Name: {verificationResult.studentName}</p>
            <p>Course: {verificationResult.courseName}</p>
            <p>Issue Date: {verificationResult.issueDate}</p>
            <p>Valid: {verificationResult.isValid ? 'Yes' : 'No'}</p>
            <p>Issuing Institution: {verificationResult.issuingInstitution}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;