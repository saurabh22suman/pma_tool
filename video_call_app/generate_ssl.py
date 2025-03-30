import os
from OpenSSL import crypto

def generate_self_signed_cert(cert_file, key_file):
    """Generate a self-signed certificate and private key"""
    # Create a key pair
    k = crypto.PKey()
    k.generate_key(crypto.TYPE_RSA, 2048)
    
    # Create a self-signed cert
    cert = crypto.X509()
    cert.get_subject().C = "US"
    cert.get_subject().ST = "State"
    cert.get_subject().L = "City"
    cert.get_subject().O = "Organization"
    cert.get_subject().OU = "Organizational Unit"
    cert.get_subject().CN = "localhost"
    cert.set_serial_number(1000)
    cert.gmtime_adj_notBefore(0)
    cert.gmtime_adj_notAfter(10*365*24*60*60)  # 10 years
    cert.set_issuer(cert.get_subject())
    cert.set_pubkey(k)
    cert.sign(k, 'sha256')
    
    # Write certificate and key to files
    with open(cert_file, "wb") as f:
        f.write(crypto.dump_certificate(crypto.FILETYPE_PEM, cert))
    
    with open(key_file, "wb") as f:
        f.write(crypto.dump_privatekey(crypto.FILETYPE_PEM, k))
    
    print(f"Self-signed certificate generated: {cert_file}")
    print(f"Private key generated: {key_file}")

if __name__ == "__main__":
    # Create ssl directory if it doesn't exist
    ssl_dir = "ssl"
    if not os.path.exists(ssl_dir):
        os.makedirs(ssl_dir)
    
    cert_file = os.path.join(ssl_dir, "cert.pem")
    key_file = os.path.join(ssl_dir, "key.pem")
    
    generate_self_signed_cert(cert_file, key_file)
    print("\nNOTE: This is a self-signed certificate for development purposes only.")
    print("For production, use a certificate from a trusted Certificate Authority.")
