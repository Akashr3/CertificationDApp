// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract StudentCredential {
    // Structs
    struct Certificate {
        string studentName;
        string courseName;
        uint256 issueDate;
        string certificateHash;
        bool isValid;
        address issuingInstitution;
    }

    struct Institution {
        string name;
        bool isAuthorized;
        address institutionAddress;
    }

    // State Variables
    mapping(bytes32 => Certificate) public certificates;
    mapping(address => Institution) public institutions;
    address public owner;
    
    // Events
    event CertificateIssued(
        bytes32 indexed certificateId,
        string studentName,
        string courseName,
        uint256 issueDate
    );
    
    event InstitutionAdded(
        address indexed institutionAddress,
        string name
    );

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyAuthorizedInstitution() {
        require(institutions[msg.sender].isAuthorized, "Not authorized institution");
        _;
    }

    // Functions
    function addInstitution(address _institutionAddress, string memory _name) 
        public 
        onlyOwner 
    {
        institutions[_institutionAddress] = Institution({
            name: _name,
            isAuthorized: true,
            institutionAddress: _institutionAddress
        });
        
        emit InstitutionAdded(_institutionAddress, _name);
    }

    function issueCertificate(
        string memory _studentName,
        string memory _courseName,
        string memory _certificateHash
    ) 
        public 
        onlyAuthorizedInstitution 
        returns (bytes32)
    {
        bytes32 certificateId = keccak256(
            abi.encodePacked(_studentName, _courseName, block.timestamp, msg.sender)
        );

        certificates[certificateId] = Certificate({
            studentName: _studentName,
            courseName: _courseName,
            issueDate: block.timestamp,
            certificateHash: _certificateHash,
            isValid: true,
            issuingInstitution: msg.sender
        });

        emit CertificateIssued(
            certificateId,
            _studentName,
            _courseName,
            block.timestamp
        );

        return certificateId;
    }

    function verifyCertificate(bytes32 _certificateId) 
        public 
        view 
        returns (
            string memory studentName,
            string memory courseName,
            uint256 issueDate,
            string memory certificateHash,
            bool isValid,
            address issuingInstitution
        ) 
    {
        Certificate memory cert = certificates[_certificateId];
        return (
            cert.studentName,
            cert.courseName,
            cert.issueDate,
            cert.certificateHash,
            cert.isValid,
            cert.issuingInstitution
        );
    }

    function revokeCertificate(bytes32 _certificateId) 
        public 
        onlyAuthorizedInstitution 
    {
        require(
            certificates[_certificateId].issuingInstitution == msg.sender,
            "Only issuing institution can revoke"
        );
        certificates[_certificateId].isValid = false;
    }
}