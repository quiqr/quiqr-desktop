class VoidPublisher{
    publish(context){
        return Promise.resolve();
    }
}

module.exports = VoidPublisher;
