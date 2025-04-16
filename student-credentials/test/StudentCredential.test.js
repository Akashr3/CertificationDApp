const StudentCredential = artifacts.require("StudentCredential");
const truffleAssert = require('truffle-assertions');

contract("StudentCredential", accounts => {
    let studentCredentialInstance;
    const owner = accounts<source_id data="0" title="Assignment 5.docx.pdf" />;  // Correct syntax
    const institution = accounts[1];
    
    before(async () => {
        studentCredentialInstance = await StudentCredential.deployed();
    });

    it("should add new institution", async () => {
        const result = await studentCredentialInstance.addInstitution(
            institution,
            "Test University",
            { from: owner }
        );

        truffleAssert.eventEmitted(result, 'InstitutionAdded', (ev) => {
            return ev.institutionAddress === institution;
        });
    });

    it("should issue new certificate", async () => {
        const result = await studentCredentialInstance.issueCertificate(
            "John Doe",
            "Computer Science",
            "QmHash123",
            { from: institution }
        );

        truffleAssert.eventEmitted(result, 'CertificateIssued', (ev) => {
            return ev.studentName === "John Doe";
        });
    });
});